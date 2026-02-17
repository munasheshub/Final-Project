// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title  CertificateVerification
 * @author —
 * @notice On-chain academic certificate issuance, verification, and revocation.
 *         Institutions are authorised by the contract admin and issue certificates
 *         whose full document is stored off-chain on IPFS; only the content-identifier
 *         (CID) and a keccak256 hash of the document are anchored here.
 *
 * ──────────────────────────────────────────────────────────────────────────────
 *  ROLES
 * ──────────────────────────────────────────────────────────────────────────────
 *  Admin        – deployer (or transferred successor).  Manages institutions.
 *  Institution  – authorised wallet.  Issues & revokes its own certificates.
 *  Public       – anyone may call the read-only verification functions.
 *
 * ──────────────────────────────────────────────────────────────────────────────
 *  KEY FLOWS
 * ──────────────────────────────────────────────────────────────────────────────
 *  1. Admin  → authorizeInstitution()         register + activate
 *  2. Admin  → deauthorizeInstitution()       soft-deactivate
 *  3. Admin  → reauthorizeInstitution()       re-activate            [NEW]
 *  4. Admin  → updateInstitutionAddress()     rotate compromised key [NEW]
 *  5. Admin  → transferAdmin()                hand off admin role
 *
 *  6. Institution → issueCertificate()        single issuance
 *  7. Institution → batchIssueCertificates()  batch ≤ 50
 *  8. Institution → revokeCertificate()       own certificates only
 *
 *  9. Public  → verifyCertificate()           lightweight status check
 * 10. Public  → getCertificateDetails()       full struct
 * 11. Public  → certificateExists()           existence flag
 * 12. Public  → getInstitution()              name + active flag
 * 13. Public  → getInstitutions()             all registered IDs
 * 14. Public  → getStats()                    total certificate count
 */
contract CertificateVerification {

    // =========================================================================
    // State Variables
    // =========================================================================

    /// @notice Current contract administrator.
    address public admin;

    /// @notice Running count of all certificates ever issued (never decremented).
    uint32 public certificateCount;

    // =========================================================================
    // Structs
    // =========================================================================

    /**
     * @dev Certificate record.
     *      Packed tightly to reduce storage slots.
     *
     *  Field        | Type    | Notes
     *  -------------|---------|--------------------------------------------------
     *  certHash     | bytes32 | keccak256 of the certificate document
     *  ipfsCID      | bytes32 | IPFS content-identifier (CIDv1 bytes32 encoding)
     *  issueDate    | uint64  | Unix timestamp supplied by the institution
     *  studentId    | uint32  | Off-chain student identifier
     *  institutionId| uint16  | Issuing institution identifier
     *  status       | uint8   | 0 = Invalid, 1 = Valid, 2 = Revoked
     *  exists       | bool    | Guard flag – false means the slot is empty
     */
    struct Certificate {
        bytes32 certHash;
        bytes32 ipfsCID;
        uint64  issueDate;
        uint32  studentId;
        uint16  institutionId;
        uint8   status;
        bool    exists;
    }

    /**
     * @dev Institution record.
     *
     *  Field  | Type   | Notes
     *  -------|--------|----------------------------------------------------
     *  name   | string | Human-readable name
     *  active | bool   | Whether the institution may currently issue certs
     *  exists | bool   | Guard flag – false means the slot is empty
     */
    struct Institution {
        string name;
        bool   active;
        bool   exists;
    }

    // =========================================================================
    // Storage
    // =========================================================================

    /// @dev certHash → Certificate
    mapping(bytes32 => Certificate) private certificates;

    /// @dev institutionId → Institution
    mapping(uint16 => Institution)  private institutions;

    /**
     * @notice Maps an institution's wallet address to its numeric ID.
     * @dev    Value 0 is reserved (meaning "not an institution").
     *         Updated by authorizeInstitution and updateInstitutionAddress.
     */
    mapping(address => uint16) public institutionAddresses;

    /// @dev Ordered list of all registered institution IDs for enumeration.
    uint16[] private institutionIds;

    /// @dev institutionId → index in institutionIds array.
    mapping(uint16 => uint256) private institutionIndex;

    /**
     * @dev Composite uniqueness guard: one institution may certify each student
     *      at most once.  Key = keccak256(studentId ++ institutionId).
     */
    mapping(bytes32 => bool) private studentInstitutionUsed;

    // =========================================================================
    // Events
    // =========================================================================

    /// @notice Emitted when a certificate is successfully issued.
    event CertificateIssued(
        bytes32 indexed certHash,
        uint32  indexed studentId,
        uint16  indexed institutionId,
        uint64          issueDate
    );

    /// @notice Emitted when a certificate is revoked.
    event CertificateRevoked(
        bytes32 indexed certHash,
        uint16  indexed institutionId,
        uint64          revokeDate
    );

    /// @notice Emitted when an institution is first registered.
    event InstitutionAuthorized(
        uint16  indexed institutionId,
        address         institutionAddress,
        string          name
    );

    /// @notice Emitted when an institution is deactivated.
    event InstitutionDeauthorized(uint16 indexed institutionId);

    /// @notice Emitted when a previously deactivated institution is re-activated.
    event InstitutionReauthorized(uint16 indexed institutionId);

    /**
     * @notice Emitted when an institution's signing wallet is rotated.
     * @param  institutionId  The institution whose address was updated.
     * @param  oldAddress     The previous wallet (now unmapped).
     * @param  newAddress     The new wallet (now mapped).
     */
    event InstitutionAddressUpdated(
        uint16  indexed institutionId,
        address         oldAddress,
        address         newAddress
    );

    /// @notice Emitted when the admin role is transferred.
    event AdminTransferred(address indexed oldAdmin, address indexed newAdmin);

    // =========================================================================
    // Modifiers
    // =========================================================================

    /// @dev Restricts a function to the current admin.
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    /**
     * @dev Restricts a function to an active, registered institution.
     *      Reads the caller's institution ID from institutionAddresses.
     *      Reverts if the ID is 0 (not registered) or the institution is inactive.
     */
    modifier onlyAuthorizedInstitution() {
        uint16 id = institutionAddresses[msg.sender];
        require(id != 0, "Not authorized");
        require(institutions[id].active, "Institution inactive");
        _;
    }

    // =========================================================================
    // Constructor
    // =========================================================================

    /**
     * @notice Deploys the contract and sets the deployer as the initial admin.
     */
    constructor() {
        admin = msg.sender;
    }

    // =========================================================================
    // Internal Helpers
    // =========================================================================

    /**
     * @dev Derives the composite key used to enforce one-cert-per-student-per-
     *      institution uniqueness.
     * @param studentId     Off-chain student identifier.
     * @param institutionId Numeric institution identifier.
     * @return              keccak256 hash of the concatenated values.
     */
    function _studentInstitutionKey(
        uint32 studentId,
        uint16 institutionId
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(studentId, institutionId));
    }

    // =========================================================================
    // Admin – Institution Management
    // =========================================================================

    /**
     * @notice Registers a new institution and activates it immediately.
     * @dev    institutionId 0 is reserved; the address must not already be
     *         mapped to any institution.
     * @param  institutionId      Unique numeric ID chosen by admin.
     * @param  institutionAddress Wallet that will sign certificate transactions.
     * @param  name               Human-readable name of the institution.
     *
     * Emits {InstitutionAuthorized}.
     */
    function authorizeInstitution(
        uint16          institutionId,
        address         institutionAddress,
        string calldata name
    ) external onlyAdmin {
        require(institutionId != 0,                "Invalid ID");
        require(institutionAddress != address(0),  "Invalid address");
        require(!institutions[institutionId].exists,"Institution exists");
        require(
            institutionAddresses[institutionAddress] == 0,
            "Address already mapped"
        );

        institutions[institutionId] = Institution({
            name:   name,
            active: true,
            exists: true
        });

        institutionAddresses[institutionAddress] = institutionId;
        institutionIndex[institutionId]          = institutionIds.length;
        institutionIds.push(institutionId);

        emit InstitutionAuthorized(institutionId, institutionAddress, name);
    }

    /**
     * @notice Deactivates an institution.  Its historical certificates remain
     *         verifiable but it can no longer issue or revoke certificates.
     * @param  institutionId The institution to deactivate.
     *
     * Emits {InstitutionDeauthorized}.
     */
    function deauthorizeInstitution(uint16 institutionId) external onlyAdmin {
        require(institutions[institutionId].exists, "Institution not found");
        require(institutions[institutionId].active, "Already inactive");

        institutions[institutionId].active = false;

        emit InstitutionDeauthorized(institutionId);
    }

    /**
     * @notice Re-activates a previously deauthorized institution.
     * @dev    Fixes the gap in the original contract where deauthorization was
     *         permanent with no path back.
     * @param  institutionId The institution to re-activate.
     *
     * Emits {InstitutionReauthorized}.
     */
    function reauthorizeInstitution(uint16 institutionId) external onlyAdmin {
        require(institutions[institutionId].exists,  "Institution not found");
        require(!institutions[institutionId].active, "Already active");

        institutions[institutionId].active = true;

        emit InstitutionReauthorized(institutionId);
    }

    /**
     * @notice Rotates the signing wallet of an institution without changing its
     *         ID or any of its certificates.
     * @dev    Fixes the gap where a compromised key could not be replaced.
     *         The old address mapping is cleared; the new address must not
     *         already be mapped to a different institution.
     * @param  institutionId The institution whose address should be updated.
     * @param  oldAddress    Current signing wallet (used to locate & clear the mapping).
     * @param  newAddress    New signing wallet.
     *
     * Emits {InstitutionAddressUpdated}.
     */
    function updateInstitutionAddress(
        uint16  institutionId,
        address oldAddress,
        address newAddress
    ) external onlyAdmin {
        require(institutions[institutionId].exists,   "Institution not found");
        require(newAddress != address(0),             "Invalid address");
        require(
            institutionAddresses[oldAddress] == institutionId,
            "Old address mismatch"
        );
        require(
            institutionAddresses[newAddress] == 0,
            "New address already mapped"
        );

        delete institutionAddresses[oldAddress];
        institutionAddresses[newAddress] = institutionId;

        emit InstitutionAddressUpdated(institutionId, oldAddress, newAddress);
    }

    // =========================================================================
    // Admin – Reads
    // =========================================================================

    /**
     * @notice Returns the name and active status of an institution.
     * @param  institutionId The institution to query.
     * @return name          Human-readable name.
     * @return active        Whether the institution is currently active.
     */
    function getInstitution(uint16 institutionId)
        external
        view
        returns (string memory name, bool active)
    {
        Institution memory inst = institutions[institutionId];
        require(inst.exists, "Institution not found");
        return (inst.name, inst.active);
    }

    /**
     * @notice Returns the array of all registered institution IDs.
     * @dev    Includes both active and inactive institutions.
     * @return Array of uint16 institution IDs in registration order.
     */
    function getInstitutions() external view returns (uint16[] memory) {
        return institutionIds;
    }

    // =========================================================================
    // Certificate Issuance
    // =========================================================================

    /**
     * @notice Issues a single certificate from the calling institution.
     * @dev    - certHash must be unique globally.
     *         - studentId + institutionId must not have been used before.
     *         - issueDate is caller-supplied (no on-chain validation); frontends
     *           should pass block.timestamp or a verified date.
     * @param  certHash  keccak256 hash of the certificate document.
     * @param  ipfsCID   IPFS CID (bytes32-encoded) of the full document.
     * @param  studentId Off-chain student identifier.
     * @param  issueDate Unix timestamp of issuance.
     *
     * Emits {CertificateIssued}.
     */
    function issueCertificate(
        bytes32 certHash,
        bytes32 ipfsCID,
        uint32  studentId,
        uint64  issueDate
    ) external onlyAuthorizedInstitution {
        require(certHash  != bytes32(0), "Invalid hash");
        require(studentId != 0,          "Invalid student ID");
        require(!certificates[certHash].exists, "Certificate exists");

        uint16  institutionId  = institutionAddresses[msg.sender];
        bytes32 compositeKey   = _studentInstitutionKey(studentId, institutionId);
        require(!studentInstitutionUsed[compositeKey], "Student already certified");

        certificates[certHash] = Certificate({
            certHash:      certHash,
            ipfsCID:       ipfsCID,
            issueDate:     issueDate,
            studentId:     studentId,
            institutionId: institutionId,
            status:        1,
            exists:        true
        });

        studentInstitutionUsed[compositeKey] = true;

        unchecked { certificateCount++; }

        emit CertificateIssued(certHash, studentId, institutionId, issueDate);
    }

    /**
     * @notice Issues up to 50 certificates in a single transaction.
     * @dev    All four arrays must have the same length (≤ 50).
     *         Each entry is subject to the same validation as issueCertificate.
     *         certificateCount is incremented once at the end for gas savings.
     * @param  certHashes  Array of certificate document hashes.
     * @param  ipfsCIDs    Array of corresponding IPFS CIDs.
     * @param  studentIds  Array of student identifiers.
     * @param  issueDates  Array of issue timestamps.
     *
     * Emits {CertificateIssued} for each certificate.
     */
    function batchIssueCertificates(
        bytes32[] calldata certHashes,
        bytes32[] calldata ipfsCIDs,
        uint32[]  calldata studentIds,
        uint64[]  calldata issueDates
    ) external onlyAuthorizedInstitution {
        uint256 length = certHashes.length;
        require(
            length == ipfsCIDs.length  &&
            length == studentIds.length &&
            length == issueDates.length,
            "Array length mismatch"
        );
        require(length > 0,   "Empty batch");
        require(length <= 50, "Batch too large");

        uint16 institutionId = institutionAddresses[msg.sender];

        for (uint256 i = 0; i < length;) {
            require(certHashes[i] != bytes32(0), "Invalid hash");
            require(studentIds[i] != 0,          "Invalid student ID");
            require(!certificates[certHashes[i]].exists, "Certificate exists");

            bytes32 compositeKey = _studentInstitutionKey(studentIds[i], institutionId);
            require(!studentInstitutionUsed[compositeKey], "Duplicate student");

            certificates[certHashes[i]] = Certificate({
                certHash:      certHashes[i],
                ipfsCID:       ipfsCIDs[i],
                issueDate:     issueDates[i],
                studentId:     studentIds[i],
                institutionId: institutionId,
                status:        1,
                exists:        true
            });

            studentInstitutionUsed[compositeKey] = true;

            emit CertificateIssued(certHashes[i], studentIds[i], institutionId, issueDates[i]);

            unchecked { i++; }
        }

        unchecked { certificateCount += uint32(length); }
    }

    // =========================================================================
    // Verification (Public)
    // =========================================================================

    /**
     * @notice Lightweight certificate validity check.
     * @dev    Returns isValid = true only when exists == true AND status == 1.
     *         All other fields are returned regardless of validity so that
     *         callers can still read metadata for revoked certificates.
     * @param  certHash    Hash of the certificate to query.
     * @return isValid     True if the certificate is current and unrevoked.
     * @return studentId   Student the certificate belongs to.
     * @return institutionId Institution that issued it.
     * @return issueDate   Timestamp recorded at issuance.
     * @return ipfsCID     IPFS CID of the full document.
     */
    function verifyCertificate(bytes32 certHash)
        external
        view
        returns (
            bool    isValid,
            uint32  studentId,
            uint16  institutionId,
            uint64  issueDate,
            bytes32 ipfsCID
        )
    {
        Certificate memory cert = certificates[certHash];
        isValid       = cert.exists && cert.status == 1;
        studentId     = cert.studentId;
        institutionId = cert.institutionId;
        issueDate     = cert.issueDate;
        ipfsCID       = cert.ipfsCID;
    }

    /**
     * @notice Returns the full Certificate struct for a given hash.
     * @dev    Reverts if the certificate does not exist.
     * @param  certHash Hash to query.
     * @return Full Certificate struct including status and IPFS CID.
     */
    function getCertificateDetails(bytes32 certHash)
        external
        view
        returns (Certificate memory)
    {
        require(certificates[certHash].exists, "Certificate not found");
        return certificates[certHash];
    }

    /**
     * @notice Returns whether a certificate record exists (any status).
     * @param  certHash Hash to query.
     * @return True if a certificate with that hash has ever been issued.
     */
    function certificateExists(bytes32 certHash) external view returns (bool) {
        return certificates[certHash].exists;
    }

    // =========================================================================
    // Revocation
    // =========================================================================

    /**
     * @notice Revokes a certificate.
     * @dev    Only the institution that originally issued the certificate may
     *         revoke it.  Sets status to 2 (Revoked); this cannot be undone.
     * @param  certHash Hash of the certificate to revoke.
     *
     * Emits {CertificateRevoked} with the on-chain timestamp.
     */
    function revokeCertificate(bytes32 certHash)
        external
        onlyAuthorizedInstitution
    {
        Certificate storage cert = certificates[certHash];
        require(cert.exists,  "Certificate not found");
        require(
            cert.institutionId == institutionAddresses[msg.sender],
            "Not the issuer"
        );
        require(cert.status == 1, "Not revocable (already invalid or revoked)");

        cert.status = 2;

        emit CertificateRevoked(certHash, cert.institutionId, uint64(block.timestamp));
    }

    // =========================================================================
    // Admin – Utilities
    // =========================================================================

    /**
     * @notice Transfers the admin role to a new address.
     * @dev    The outgoing admin immediately loses all admin privileges.
     * @param  newAdmin Address of the incoming admin.
     *
     * Emits {AdminTransferred}.
     */
    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid address");
        address oldAdmin = admin;
        admin = newAdmin;
        emit AdminTransferred(oldAdmin, newAdmin);
    }

    // =========================================================================
    // Public – Statistics
    // =========================================================================

    /**
     * @notice Returns the total number of certificates ever issued.
     * @return totalCerts Cumulative issuance count (never decremented on revoke).
     */
    function getStats() external view returns (uint32 totalCerts) {
        totalCerts = certificateCount;
    }
}
