import 'package:flutter/material.dart';
import 'package:flutter_application_2/models/issue_model.dart';
import 'package:flutter_application_2/screens/citizen/details/full_issue_details_screen.dart';
import 'package:flutter_application_2/utils/colors.dart';

class IssueListCard extends StatelessWidget {
  final Issue issue;
  const IssueListCard({super.key, required this.issue});
  
  Color _getPinColor(IssueStatus status) {
    switch (status) {
      case IssueStatus.resolved:
      case IssueStatus.closed:
        return Colors.green;
      case IssueStatus.inProgress:
        return AppColors.secondary;
      default:
        return Colors.red;
    }
  }

  String _getSubtitle() {
    if (issue.locationAddress.isNotEmpty) {
      return issue.locationAddress;
    } else if (issue.assignedOfficerName != null) {
      return "Assigned: ${issue.assignedOfficerName}";
    } else if (issue.coordinates.isNotEmpty) {
      return "Lat: ${issue.coordinates[1]}, Lng: ${issue.coordinates[0]}";
    } else {
      return "No location info";
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        contentPadding: const EdgeInsets.all(16),
        title: Text(
          issue.title, 
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Text(
          _getSubtitle(),
          style: const TextStyle(color: AppColors.textSecondary),
        ),
        trailing: Chip(
          label: Text(issue.status.name.toUpperCase()),
          backgroundColor: _getPinColor(issue.status).withOpacity(0.1),
          labelStyle: TextStyle(
            color: _getPinColor(issue.status), 
            fontWeight: FontWeight.bold,
          ),
        ),
        onTap: () {
          Navigator.of(context).push(MaterialPageRoute(
            builder: (_) => FullIssueDetailsScreen(issue: issue),
          ));
        },
      ),
    );
  }
}
