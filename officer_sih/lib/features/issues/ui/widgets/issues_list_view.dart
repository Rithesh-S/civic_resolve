import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:municipal_officer_app/features/issues/bloc/issues_bloc.dart';
import 'package:municipal_officer_app/features/issues/bloc/issues_event.dart';
import 'package:municipal_officer_app/features/issues/models/issue_model.dart';
import 'package:municipal_officer_app/features/issues/ui/issue_details_page.dart';

class IssuesListView extends StatelessWidget {
  final List<Issue> issues;
  const IssuesListView({super.key, required this.issues});

  Color _getColorForPriority(IssuePriority priority) {
    switch (priority) {
      case IssuePriority.critical:
        return Colors.red;
      case IssuePriority.high:
        return Colors.orange;
      case IssuePriority.medium:
        return Colors.amber;
      default:
        return Colors.blue;
    }
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: () async {
        context.read<IssuesBloc>().add(FetchIssues());
      },
      child: ListView.builder(
        itemCount: issues.length,
        padding: const EdgeInsets.all(8),
        itemBuilder: (context, index) {
          final issue = issues[index];
          return Card(
            elevation: 1,
            margin: const EdgeInsets.symmetric(vertical: 6, horizontal: 8),
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            child: ListTile(
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              title: Text(issue.title,
                  style: const TextStyle(fontWeight: FontWeight.w600)),
              subtitle: Padding(
                padding: const EdgeInsets.only(top: 6.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text("Category: ${issue.category}"),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(Icons.circle,
                            color: _getColorForPriority(issue.priority),
                            size: 10),
                        const SizedBox(width: 4),
                        Text(issue.priority.name.toUpperCase(),
                            style: TextStyle(
                                color: _getColorForPriority(issue.priority),
                                fontWeight: FontWeight.bold)),
                        const Spacer(),
                        Text(issue.status.name.replaceAll('_', ' ').toUpperCase(),
                            style: TextStyle(
                                color: Colors.grey.shade600, fontSize: 12)),
                      ],
                    )
                  ],
                ),
              ),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => IssueDetailsPage(issueId: issue.id), // Pass ID only
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
