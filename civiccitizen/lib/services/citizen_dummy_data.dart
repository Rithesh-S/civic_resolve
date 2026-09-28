import 'package:flutter_application_2/models/issue_model.dart';
import 'package:flutter_application_2/models/citizen_model.dart'; // We'll create this next

class CitizenDummyDataService {
  static const String currentCitizenId = 'CITIZEN_001';

  static Citizen getCitizenProfile() {
    return Citizen(
      id: currentCitizenId,
      fullName: 'Priya Sharma',
      email: 'citizen@test.com',
      phone: '+91 99887 76655',
      issuesReported: 3,
      issuesUpvoted: 5,
    );
  }

  // Dummy issues adapted to the new Issue model
  static List<Issue> getAllPublicIssues() {
    return [
      Issue(
        id: 'CBE-RD-001',
        title: 'Large Pothole on Avinashi Road',
        description:
            'A very large and dangerous pothole has formed near the Nava India signal, causing traffic issues.',
        category: IssueCategory.roads,
        status: IssueStatus.inProgress, // Blue Pin
        priority: 1,
        locationAddress: 'Avinashi Road, Nava India, Coimbatore',
        coordinates: [77.016, 11.026],
        assignedOfficerId: 'JE-CBE-007',
        assignedOfficerName: 'Ravi Kumar',
        reporterId: 'Suresh P.',
        channel: 'mobile',
        createdAt: DateTime.now().subtract(const Duration(days: 1)),
        slaDueDate: DateTime.now().add(const Duration(days: 1)),
        upvoteCount: 23,
        media: [
          IssueMedia(
            url: 'https://example.com/pothole.jpg',
            type: 'image',
            role: 'report',
          ),
        ],
        statusHistory: [
          IssueStatusHistory(
            status: 'submitted',
            updatedBy: 'Suresh P.',
            timestamp: DateTime.now().subtract(const Duration(days: 1)),
          ),
          IssueStatusHistory(
            status: 'inProgress',
            updatedBy: 'JE-CBE-007',
            timestamp: DateTime.now().subtract(const Duration(hours: 12)),
          ),
        ],
      ),
      Issue(
        id: 'CBE-SN-002',
        title: 'Garbage Overflow near Brookefields',
        description:
            'The main garbage bin on the corner of the road has been overflowing for 3 days.',
        category: IssueCategory.sanitation,
        status: IssueStatus.resolved, // Green Pin
        priority: 2,
        locationAddress: 'Dr Krishnasamy Mudaliyar Rd, R.S. Puram',
        coordinates: [76.955, 11.005],
        assignedOfficerId: 'SI-CBE-004',
        assignedOfficerName: 'Meena S.',
        reporterId: 'Priya Sharma',
        channel: 'web',
        createdAt: DateTime.now().subtract(const Duration(days: 4)),
        slaDueDate: DateTime.now().subtract(const Duration(days: 1)),
        upvoteCount: 15,
        media: [
          IssueMedia(
            url: 'https://example.com/garbage.jpg',
            type: 'image',
            role: 'report',
          ),
        ],
        statusHistory: [
          IssueStatusHistory(
            status: 'submitted',
            updatedBy: 'Priya Sharma',
            timestamp: DateTime.now().subtract(const Duration(days: 4)),
          ),
          IssueStatusHistory(
            status: 'resolved',
            updatedBy: 'SI-CBE-004',
            timestamp: DateTime.now().subtract(const Duration(days: 1)),
          ),
        ],
      ),
      Issue(
        id: 'CBE-SL-003',
        title: 'Streetlight Not Working',
        description:
            'The streetlight on the main cross road in Saibaba Colony has not been working for a week.',
        category: IssueCategory.streetlight,
        status: IssueStatus.acknowledged, // Red Pin
        priority: 3,
        locationAddress: 'NSR Road, Saibaba Colony, Coimbatore',
        coordinates: [76.949, 11.025],
        assignedOfficerId: 'JE-CBE-011',
        assignedOfficerName: 'Anil K.',
        reporterId: 'Rajesh G.',
        channel: 'mobile',
        createdAt: DateTime.now().subtract(const Duration(days: 5)),
        slaDueDate: DateTime.now().add(const Duration(days: 2)),
        upvoteCount: 7,
        media: [
          IssueMedia(
            url: 'https://example.com/streetlight.jpg',
            type: 'image',
            role: 'report',
          ),
        ],
        statusHistory: [
          IssueStatusHistory(
            status: 'submitted',
            updatedBy: 'Rajesh G.',
            timestamp: DateTime.now().subtract(const Duration(days: 5)),
          ),
          IssueStatusHistory(
            status: 'acknowledged',
            updatedBy: 'JE-CBE-011',
            timestamp: DateTime.now().subtract(const Duration(days: 3)),
          ),
        ],
      ),
    ];
  }

  // Example of filtering for current user
  static List<Issue> getMyReportedIssues() {
    return getAllPublicIssues()
        .where((issue) => issue.reporterId == getCitizenProfile().fullName)
        .toList();
  }
}
