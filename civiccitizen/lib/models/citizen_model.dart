class Citizen {
  final String id;
  final String fullName;
  final String email;
  final String phone;
  final int issuesReported;
  final int issuesUpvoted;

  Citizen({
    required this.id,
    required this.fullName,
    required this.email,
    required this.phone,
    required this.issuesReported,
    required this.issuesUpvoted,
  });
}