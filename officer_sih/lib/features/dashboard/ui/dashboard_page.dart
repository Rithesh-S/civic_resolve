import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:municipal_officer_app/core/theme.dart';
import 'package:municipal_officer_app/features/auth/bloc/auth_bloc.dart';
import 'package:municipal_officer_app/features/auth/bloc/auth_state.dart';
import 'package:municipal_officer_app/features/issues/bloc/issues_bloc.dart';
import 'package:municipal_officer_app/features/issues/bloc/issues_event.dart';
import 'package:municipal_officer_app/features/issues/bloc/issues_state.dart';
import 'package:municipal_officer_app/features/issues/models/issue_model.dart';
import 'package:municipal_officer_app/features/issues/ui/issue_details_page.dart';
import 'package:municipal_officer_app/features/notifications/bloc/notification_bloc.dart';
import 'package:municipal_officer_app/features/notifications/bloc/notification_state.dart';
import 'package:municipal_officer_app/features/notifications/ui/notification_page.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});
  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  @override
  void initState() {
    super.initState();
    // Trigger the fetch when the widget is first created
    context.read<IssuesBloc>().add(FetchIssues());
  }

  @override
  Widget build(BuildContext context) {
    // --- MODIFICATION START ---
    final authState = context.watch<AuthBloc>().state;
    String? userName;
    if (authState is AuthSuccess) {
      // Get the full name from the user object
      userName = authState.user.fullName;
    }
    // --- MODIFICATION END ---

    return Scaffold(
      extendBodyBehindAppBar: true,
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          "Dashboard",
          style: GoogleFonts.inter(
              color: Colors.white, fontWeight: FontWeight.bold),
        ),
        actions: [
          // Notification Icon with Badge
          IconButton(
            onPressed: () {
              context.read<IssuesBloc>().add(FetchIssues());
            },
            icon: const Icon(CupertinoIcons.refresh, color: Colors.white),
            tooltip: 'Refresh Issues',
          ),
          BlocBuilder<NotificationBloc, NotificationState>(
            builder: (context, state) {
              final hasUnread = state is NotificationLoaded &&
                  state.notifications.any((n) => !n.isRead);
              return Stack(
                children: [
                  IconButton(
                    onPressed: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (_) => const NotificationPage())),
                    icon: const Icon(CupertinoIcons.bell, color: Colors.white),
                  ),
                  if (hasUnread)
                    Positioned(
                      right: 10,
                      top: 10,
                      child: Container(
                        padding: const EdgeInsets.all(2),
                        decoration: BoxDecoration(
                            color: AppTheme.accentYellow,
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(
                                color: AppTheme.primaryDark, width: 2)),
                        constraints:
                            const BoxConstraints(minWidth: 12, minHeight: 12),
                      ),
                    )
                ],
              );
            },
          )
        ],
      ),
      body: Stack(
        children: [
          // --- Background Header ---
          _buildHeaderBackground(),
          // --- Scrollable Content ---
          SafeArea(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 40), // Space for AppBar
                  _buildGreeting(userName),
                  const SizedBox(height: 60),
                  _buildStatsAndIssues(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // --- UI Helper Widgets (No changes needed below) ---

  Widget _buildHeaderBackground() {
    return Container(
      height: 250,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [AppTheme.primaryDark, AppTheme.accentBlue],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.only(
            bottomLeft: Radius.circular(30), bottomRight: Radius.circular(30)),
      ),
    );
  }

  Widget _buildGreeting(String? userName) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "Hello,",
            style: GoogleFonts.inter(
                fontSize: 28, color: Colors.white.withOpacity(0.8)),
          ),
          Text(
            userName ?? 'Officer',
            style: GoogleFonts.inter(
                fontSize: 32, color: Colors.white, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsAndIssues() {
    return BlocBuilder<IssuesBloc, IssuesState>(
      builder: (context, state) {
        if (state is IssuesLoading || state is IssuesInitial) {
          return const Center(
              child: CircularProgressIndicator(color: Colors.white));
        }
        if (state is IssuesLoaded) {
          final allIssues = state.issues;
          final newIssuesCount = allIssues
              .where((i) => i.status == IssueStatus.acknowledged)
              .length;
          final inProgressCount = allIssues
              .where((i) => i.status == IssueStatus.in_progress)
              .length;
          // Your current code
          bool isOverdue(Issue issue) {
            final dueDate = issue.slaDueDate;
            // 1. If there's no due date, it cannot be overdue.
            if (dueDate == null) {
              return false;
            }
            // 2. Check if the due date is before now and the issue isn't resolved.
            return dueDate.isBefore(DateTime.now()) &&
                issue.status != IssueStatus.resolved &&
                issue.status != IssueStatus.closed;
          }

          final overdueCount = allIssues.where(isOverdue).length;
          final criticalIssues = allIssues
              .where((i) =>
                  i.priority == IssuePriority.critical &&
                  i.status != IssueStatus.resolved)
              .toList();

          return Column(
            children: [
              // --- Stats Section ---
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Row(
                  children: [
                    _buildStatCard(
                        count: newIssuesCount.toString(),
                        title: "New",
                        color: AppTheme.accentBlue,
                        icon: CupertinoIcons.doc_text_search),
                    const SizedBox(width: 16),
                    _buildStatCard(
                        count: overdueCount.toString(),
                        title: "Overdue",
                        color: Colors.red.shade600,
                        icon: CupertinoIcons.exclamationmark_triangle),
                    const SizedBox(width: 16),
                    _buildStatCard(
                        count: inProgressCount.toString(),
                        title: "In Progress",
                        color: AppTheme.accentYellow,
                        icon: CupertinoIcons.time),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              // --- Critical Issues List ---
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "Critical Issues",
                      style: GoogleFonts.inter(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primaryDark),
                    ),
                    const SizedBox(height: 12),
                    if (criticalIssues.isEmpty)
                      const Center(
                          child: Padding(
                              padding: EdgeInsets.all(32.0),
                              child: Text("No critical issues. Great job!")))
                    else
                      ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: criticalIssues.length,
                        itemBuilder: (context, index) => _buildIssueTile(
                            context,
                            issue: criticalIssues[index]),
                      ),
                  ],
                ),
              ),
            ],
          );
        }
        return Center(child: Text("Error: ${(state as IssuesError).message}"));
      },
    );
  }

  Widget _buildStatCard(
      {required String count,
      required String title,
      required Color color,
      required IconData icon}) {
    return Expanded(
      child: Card(
        elevation: 4,
        shadowColor: color.withOpacity(0.3),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(icon, color: color, size: 28),
              const SizedBox(height: 16),
              Text(
                count,
                style: GoogleFonts.inter(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primaryDark),
              ),
              Text(title, style: TextStyle(color: Colors.grey.shade600)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildIssueTile(BuildContext context, {required Issue issue}) {
    final priorityColor =
        issue.priority == IssuePriority.critical ? Colors.red : Colors.orange;

    return Card(
      elevation: 1,
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: CircleAvatar(
          backgroundColor: priorityColor.withOpacity(0.1),
          child: Icon(
              issue.category == "Streetlight"
                  ? CupertinoIcons.lightbulb
                  : CupertinoIcons.wrench,
              color: priorityColor),
        ),
        title: Text(issue.title,
            style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle:
            Text(issue.category, style: TextStyle(color: Colors.grey.shade600)),
        trailing: const Icon(Icons.chevron_right, color: Colors.grey),
        onTap: () => Navigator.push(
            context,
            MaterialPageRoute(
                builder: (_) => IssueDetailsPage(issueId: issue.id))),
      ),
    );
  }
}
