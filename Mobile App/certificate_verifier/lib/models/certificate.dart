class Certificate {
  final String id;
  final String certificateName;
  final String issuerName;
  final String recipientName;
  final DateTime issueDate;
  final String blockchainHash;
  final VerificationStatus status;
  final double confidenceScore;
  final String? imageUrl;
  
  Certificate({
    required this.id,
    required this.certificateName,
    required this.issuerName,
    required this.recipientName,
    required this.issueDate,
    required this.blockchainHash,
    required this.status,
    required this.confidenceScore,
    this.imageUrl,
  });
  
  factory Certificate.fromJson(Map<String, dynamic> json) {
    return Certificate(
      id: json['id'],
      certificateName: json['certificateName'],
      issuerName: json['issuerName'],
      recipientName: json['recipientName'],
      issueDate: DateTime.parse(json['issueDate']),
      blockchainHash: json['blockchainHash'],
      status: VerificationStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => VerificationStatus.pending,
      ),
      confidenceScore: json['confidenceScore'].toDouble(),
      imageUrl: json['imageUrl'],
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'certificateName': certificateName,
      'issuerName': issuerName,
      'recipientName': recipientName,
      'issueDate': issueDate.toIso8601String(),
      'blockchainHash': blockchainHash,
      'status': status.name,
      'confidenceScore': confidenceScore,
      'imageUrl': imageUrl,
    };
  }
}

enum VerificationStatus {
  verified,
  fraudulent,
  pending,
  notFound,
}

extension VerificationStatusExtension on VerificationStatus {
  String get displayName {
    switch (this) {
      case VerificationStatus.verified:
        return 'Verified';
      case VerificationStatus.fraudulent:
        return 'Fraudulent';
      case VerificationStatus.pending:
        return 'Pending';
      case VerificationStatus.notFound:
        return 'Not Found';
    }
  }
}
