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
*  STUDENT ID FORMAT
* ──────────────────────────────────────────────────────────────────────────────
*  Student IDs are alphanumeric strings up to 15 characters (e.g. "n02220242w").
*  They are stored as bytes16 — a fixed-size, gas-efficient value type that
*  holds up to 15 ASCII bytes with one byte of zero-padding.  Callers must
*  left-align the string in the bytes16 value (i.e. cast/pad on the client side).
*  bytes16 cannot exceed 15 meaningful characters; the zero byte at index 15
*  is treated as the null terminator.
*
* ──────────────────────────────────────────────────────────────────────────────
*  WHY bytes16 AND NOT string
* ──────────────────────────────────────────────────────────────────────────────
*  • Fixed-size value type → cheaper storage and calldata
*  • Can be used as an indexed event parameter
*  • Can be passed directly to abi.encodePacked for composite keys
*  • No unbounded input risk
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
*  1.  Admin  → authorizeInstitution()        register + activate
*  2.  Admin  → deauthorizeInstitution()      soft-deactivate
*  3.  Admin  → reauthorizeInstitution()      re-activate
*  4.  Admin  → updateInstitutionAddress()    rotate compromised signing key
*  5.  Admin  → updateInstitution()           update institution name          ← NEW
*  6.  Admin  → transferAdmin()               hand off admin role
*
*  7.  Institution → issueCertificate()       single issuance
*  8.  Institution → batchIssueCertificates() batch ≤ 50
*  9.  Institution → revokeCertificate()      own certificates only
*
*  10. Public → verifyCertificate()           lightweight status check
*  11. Public → getCertificateDetails()       full struct
*  12. Public → certificateExists()           existence flag
*  13. Public → getInstitution()              name + active flag
*  14. Public → getInstitutions()             all registered IDs
*  15. Public → getAllInstitutions()          full details for all institutions  ← NEW
*  16. Public → getStats()                    total certificate count
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
     *
     *  Field         | Type    | Notes
     *  --------------|---------|------------------------------------------------
     *  certHash      | bytes32 | keccak256 of the certificate document
     *  ipfsCID       | bytes32 | IPFS content-identifier (CIDv1 bytes32 encoding)
     *  issueDate     | uint64  | Unix timestamp supplied by the institution
     *  studentId     | bytes16 | Alphanumeric student ID, max 15 chars, left-aligned
     *  institutionId | uint16  | Issuing institution identifier
     *  status        | uint8   | 0 = Invalid, 1 = Valid, 2 = Revoked
     *  exists        | bool    | Guard flag – false means the slot is empty
     */
    struct Certificate {
        bytes32 certHash;
        bytes32 ipfsCID;
        uint64  issueDate;
        bytes16 studentId;
        uint16  institutionId;
        uint8   status;
        bool    exists;
    }
 
    /**
     * @dev Institution record.
     *
     *  Field  | Type   | Notes
     *  -------|--------|------------------------------------------------------
     *  name   | string | Human-readable name
     *  active | bool   | Whether the institution may currently issue certs
     *  exists | bool   | Guard flag – false means the slot is empty
     */
    struct Institution {
        string name;
        bool   active;
        bool   exists;
    }

    /**
     * @dev View struct returned by getAllInstitutions().
     *      Bundles all institution details including wallet address for
     *      convenient off-chain consumption without extra calls.
     *
     *  Field             | Type    | Notes
     *  ------------------|---------|------------------------------------------
     *  institutionId     | uint16  | Numeric identifier
     *  name              | string  | Human-readable name
     *  active            | bool    | Current active status
     *  walletAddress     | address | Current signing wallet address
     */
    struct InstitutionView {
        uint16  institutionId;
        string  name;
        bool    active;
        address walletAddress;
    }
 
    // =========================================================================
    // Storage
    // =========================================================================
 
    /// @dev certHash → Certificate
    mapping(bytes32 => Certificate) private certificates;
 
    /// @dev institutionId → Institution
    mapping(uint16 => Institution) private institutions;
 
    /**
     * @notice Maps an institution's wallet address to its numeric ID.
     * @dev    Value 0 is reserved (meaning "not an institution").
     */
    mapping(address => uint16) public institutionAddresses;

    /**
     * @dev Reverse mapping: institutionId → current wallet address.
     *      Kept in sync with institutionAddresses for O(1) reverse lookup
     *      without iterating all addresses.
     */
    mapping(uint16 => address) private institutionWallet;
 
    /// @dev Ordered list of all registered institution IDs for enumeration.
    uint16[] private institutionIds;
 
    /// @dev institutionId → index in institutionIds array.
    mapping(uint16 => uint256) private institutionIndex;
 
    /**
     * @dev Composite uniqueness guard: one institution may certify each student
     *      at most once.
     *      Key = keccak256(abi.encodePacked(studentId, institutionId))
     */
    mapping(bytes32 => bool) private studentInstitutionUsed;
 
    // =========================================================================
    // Events
    // =========================================================================
 
    event CertificateIssued(
        bytes32 indexed certHash,
        bytes16 indexed studentId,
        uint16  indexed institutionId,
        uint64          issueDate
    );
 
    event CertificateRevoked(
        bytes32 indexed certHash,
        uint16  indexed institutionId,
        uint64          revokeDate
    );
 
    event InstitutionAuthorized(
        uint16  indexed institutionId,
        address         institutionAddress,
        string          name
    );
 
    event InstitutionDeauthorized(uint16 indexed institutionId);
 
    event InstitutionReauthorized(uint16 indexed institutionId);
 
    event InstitutionAddressUpdated(
        uint16  indexed institutionId,
        address         oldAddress,
        address         newAddress
    );

    /**
     * @notice Emitted when an institution's name is updated.
     * @param  institutionId The institution whose name was changed.
     * @param  oldName       Previous name.
     * @param  newName       New name.
     */
    event InstitutionUpdated(
        uint16  indexed institutionId,
        string          oldName,
        string          newName
    );
 
    event AdminTransferred(address indexed oldAdmin, address indexed newAdmin);
 
    // =========================================================================
    // Modifiers
    // =========================================================================
 
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }
 
    modifier onlyAuthorizedInstitution() {
        uint16 id = institutionAddresses[msg.sender];
        require(id != 0, "Not authorized");
        require(institutions[id].active, "Institution inactive");
        _;
    }
 
    // =========================================================================
    // Constructor
    // =========================================================================
 
    constructor() {
        admin = msg.sender;
    }
 
    // =========================================================================
    // Internal Helpers
    // =========================================================================
 
    function _studentInstitutionKey(
        bytes16 studentId,
        uint16  institutionId
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(studentId, institutionId));
    }
 
    function _requireValidStudentId(bytes16 studentId) internal pure {
        require(studentId != bytes16(0), "Invalid student ID");
    }
 
    // =========================================================================
    // Admin – Institution Management
    // =========================================================================
 
    /**
     * @notice Registers a new institution and activates it immediately.
     * @param  institutionId      Unique numeric ID chosen by admin (must be > 0).
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
        require(institutionId != 0,                  "Invalid ID");
        require(institutionAddress != address(0),    "Invalid address");
        require(!institutions[institutionId].exists, "Institution exists");
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
        institutionWallet[institutionId]         = institutionAddress;   // ← sync reverse map
        institutionIndex[institutionId]          = institutionIds.length;
        institutionIds.push(institutionId);
 
        emit InstitutionAuthorized(institutionId, institutionAddress, name);
    }
 
    /**
     * @notice Deactivates an institution.
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
     * @notice Rotates the signing wallet of an institution.
     * @param  institutionId The institution whose address should be updated.
     * @param  oldAddress    Current signing wallet (must match stored mapping).
     * @param  newAddress    Replacement signing wallet.
     *
     * Emits {InstitutionAddressUpdated}.
     */
    function updateInstitutionAddress(
        uint16  institutionId,
        address oldAddress,
        address newAddress
    ) external onlyAdmin {
        require(institutions[institutionId].exists,    "Institution not found");
        require(newAddress != address(0),              "Invalid address");
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
        institutionWallet[institutionId] = newAddress;                   // ← sync reverse map
 
        emit InstitutionAddressUpdated(institutionId, oldAddress, newAddress);
    }

    // =========================================================================
    // Admin – Update Institution Details                                  ← NEW
    // =========================================================================

    /**
     * @notice Updates the human-readable name of an existing institution.
     * @dev    Only the name field is mutable via this function.  Active status,
     *         wallet address, and ID are managed by dedicated functions.
     *         The institution must already exist; the new name must be non-empty.
     * @param  institutionId  The institution to update.
     * @param  newName        Replacement human-readable name.
     *
     * Emits {InstitutionUpdated}.
     */
    function updateInstitution(
        uint16          institutionId,
        string calldata newName
    ) external onlyAdmin {
        require(institutions[institutionId].exists,  "Institution not found");
        require(bytes(newName).length > 0,           "Name cannot be empty");

        string memory oldName = institutions[institutionId].name;
        institutions[institutionId].name = newName;

        emit InstitutionUpdated(institutionId, oldName, newName);
    }
 
    // =========================================================================
    // Admin – Reads
    // =========================================================================
 
    /**
     * @notice Returns the name and active status of a single institution.
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
    // Public – Get All Institutions (Full Details)                        ← NEW
    // =========================================================================

    /**
     * @notice Returns full details for every registered institution in a single
     *         call, eliminating the need for multiple getInstitution() round-trips.
     * @dev    Iterates institutionIds (registration order) and assembles an
     *         InstitutionView array.  Includes both active and inactive entries.
     *         Gas cost scales linearly with the number of institutions; suitable
     *         for off-chain reads (eth_call) only — do not call from another
     *         on-chain contract in a loop.
     * @return Array of {institutionId, name, active, walletAddress} structs.
     */
    function getAllInstitutions()
        external
        view
        returns (InstitutionView[] memory)
    {
        uint256 total = institutionIds.length;
        InstitutionView[] memory result = new InstitutionView[](total);

        for (uint256 i = 0; i < total; ) {
            uint16 id = institutionIds[i];
            Institution storage inst = institutions[id];
            result[i] = InstitutionView({
                institutionId: id,
                name:          inst.name,
                active:        inst.active,
                walletAddress: institutionWallet[id]
            });
            unchecked { i++; }
        }

        return result;
    }
 
    // =========================================================================
    // Certificate Issuance
    // =========================================================================
 
    /**
     * @notice Issues a single certificate from the calling institution.
     * @param  certHash  keccak256 hash of the certificate document.
     * @param  ipfsCID   IPFS CID (bytes32-encoded) of the full document.
     * @param  studentId Alphanumeric student ID left-aligned in bytes16.
     * @param  issueDate Unix timestamp of issuance.
     *
     * Emits {CertificateIssued}.
     */
    function issueCertificate(
        bytes32 certHash,
        bytes32 ipfsCID,
        bytes16 studentId,
        uint64  issueDate
    ) external onlyAuthorizedInstitution {
        require(certHash != bytes32(0), "Invalid hash");
        _requireValidStudentId(studentId);
        require(!certificates[certHash].exists, "Certificate exists");
 
        uint16  institutionId = institutionAddresses[msg.sender];
        bytes32 compositeKey  = _studentInstitutionKey(studentId, institutionId);
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
     * @param  certHashes  Array of certificate document hashes.
     * @param  ipfsCIDs    Array of corresponding IPFS CIDs.
     * @param  studentIds  Array of bytes16-encoded student identifiers.
     * @param  issueDates  Array of Unix timestamps.
     *
     * Emits {CertificateIssued} for each certificate in the batch.
     */
    function batchIssueCertificates(
        bytes32[] calldata certHashes,
        bytes32[] calldata ipfsCIDs,
        bytes16[] calldata studentIds,
        uint64[]  calldata issueDates
    ) external onlyAuthorizedInstitution {
        uint256 length = certHashes.length;
        require(
            length == ipfsCIDs.length   &&
            length == studentIds.length &&
            length == issueDates.length,
            "Array length mismatch"
        );
        require(length > 0,   "Empty batch");
        require(length <= 50, "Batch too large");
 
        uint16 institutionId = institutionAddresses[msg.sender];
 
        for (uint256 i = 0; i < length;) {
            require(certHashes[i] != bytes32(0), "Invalid hash");
            _requireValidStudentId(studentIds[i]);
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
     * @param  certHash      Hash of the certificate to query.
     * @return isValid       True if the certificate is current and unrevoked.
     * @return studentId     bytes16-encoded student ID.
     * @return institutionId Institution that issued it.
     * @return issueDate     Timestamp recorded at issuance.
     * @return ipfsCID       IPFS CID of the full document.
     */
    function verifyCertificate(bytes32 certHash)
        external
        view
        returns (
            bool    isValid,
            bytes16 studentId,
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
     * @param  certHash Hash to query.
     * @return Full Certificate struct including status, studentId, and IPFS CID.
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
     * @dev    Only the institution that originally issued it may revoke it.
     * @param  certHash Hash of the certificate to revoke.
     *
     * Emits {CertificateRevoked} with the on-chain block.timestamp.
     */
    function revokeCertificate(bytes32 certHash)
        external
        onlyAuthorizedInstitution
    {
        Certificate storage cert = certificates[certHash];
        require(cert.exists, "Certificate not found");
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
