import 'package:flutter/material.dart';
import 'package:flutter_application_2/models/issue_model.dart';
import 'package:flutter_application_2/utils/colors.dart';
import 'package:flutter_application_2/widgets/timeline_tile.dart';

class FullIssueDetailsScreen extends StatelessWidget {
  final Issue issue;
  const FullIssueDetailsScreen({super.key, required this.issue});

  Color _getStatusColor(IssueStatus status) {
    switch (status) {
      case IssueStatus.resolved:
      case IssueStatus.closed:
        return Colors.green;
      case IssueStatus.inProgress:
        return AppColors.secondary;
      case IssueStatus.rejected:
        return Colors.red;
      case IssueStatus.acknowledged:
        return Colors.blue;
      default:
        return Colors.orange;
    }
  }

  IconData _getCategoryIcon(IssueCategory category) {
    switch (category) {
      case IssueCategory.roads:
        return Icons.edit_road_rounded;
      case IssueCategory.sanitation:
        return Icons.delete;
      case IssueCategory.streetlight:
        return Icons.lightbulb;
      case IssueCategory.parks:
        return Icons.park;
      case IssueCategory.waterleakage:
        return Icons.water_drop;
      default:
        return Icons.warning;
    }
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  String _formatTime(DateTime date) {
    return '${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
  }

  String _getPriorityText(int priority) {
    if (priority <= 2) return 'HIGH';
    if (priority <= 4) return 'MEDIUM';
    return 'LOW';
  }

  Color _getPriorityColor(int priority) {
    if (priority <= 2) return Colors.red;
    if (priority <= 4) return Colors.orange;
    return Colors.green;
  }

  List<Map<String, dynamic>> _buildTimelineFromHistory() {
    if (issue.statusHistory.isEmpty) {
      return [
        {
          'status': 'Submitted',
          'by': 'Reporter: ${issue.reporterId}',
          'time': issue.createdAt,
          'completed': true,
          'description': 'Issue was reported through ${issue.channel}'
        },
        {
          'status': 'Acknowledged',
          'by': issue.assignedOfficerName != null 
              ? 'by ${issue.assignedOfficerName}' 
              : 'by Officer #${issue.assignedOfficerId ?? 'Unassigned'}',
          'time': issue.createdAt.add(const Duration(hours: 4)),
          'completed': issue.status.index >= IssueStatus.acknowledged.index,
          'description': 'Issue was assigned to department'
        },
        {
          'status': 'In Progress',
          'by': 'Work has started on site',
          'time': issue.createdAt.add(const Duration(days: 1)),
          'completed': issue.status.index >= IssueStatus.inProgress.index,
          'description': 'Work crew dispatched to location'
        },
        {
          'status': 'Resolved',
          'by': 'Work has been completed',
          'time': issue.createdAt.add(const Duration(days: 2)),
          'completed': issue.status.index >= IssueStatus.resolved.index,
          'description': 'Issue was successfully resolved'
        },
      ];
    }

    final timeline = <Map<String, dynamic>>[];
    
    timeline.add({
      'status': 'Submitted',
      'by': 'Reporter: ${issue.reporterId}',
      'time': issue.createdAt,
      'completed': true,
      'description': 'Issue was reported through ${issue.channel}'
    });

    for (var history in issue.statusHistory) {
      timeline.add({
        'status': history.status.toUpperCase(),
        'by': 'by ${history.updatedBy}',
        'time': history.timestamp,
        'completed': true,
        'description': _getStatusDescription(history.status)
      });
    }

    return timeline;
  }

  String _getStatusDescription(String status) {
    switch (status.toLowerCase()) {
      case 'acknowledged':
        return 'Issue has been reviewed and assigned';
      case 'inprogress':
        return 'Work is actively being performed';
      case 'resolved':
        return 'Issue has been successfully resolved';
      case 'closed':
        return 'Issue is closed and completed';
      case 'rejected':
        return 'Issue was rejected after review';
      default:
        return 'Status updated';
    }
  }

  @override
  Widget build(BuildContext context) {
    final timelineEvents = _buildTimelineFromHistory();

    return Scaffold(
      appBar: AppBar(
        title: Text('Issue #${issue.id.substring(0, 8)}...'),
        centerTitle: true,
        elevation: 0,
        backgroundColor: Colors.transparent,
        foregroundColor: AppColors.textPrimary,
        actions: [
          IconButton(
            icon: const Icon(Icons.more_vert),
            onPressed: () {
              // Show more options
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Media Gallery Section
            if (issue.media.isNotEmpty)
              Container(
                height: 220,
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: PageView.builder(
                  itemCount: issue.media.length,
                  itemBuilder: (context, index) {
                    final media = issue.media[index];
                    return Container(
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Stack(
                          children: [
                            // Image with proper error handling
                            Container(
                              width: double.infinity,
                              height: double.infinity,
                              color: Colors.grey[200],
                              child: Image.network(
                                media.url,
                                fit: BoxFit.cover,
                                loadingBuilder: (context, child, loadingProgress) {
                                  if (loadingProgress == null) return child;
                                  return Container(
                                    color: Colors.grey[200],
                                    child: Center(
                                      child: Column(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          CircularProgressIndicator(
                                            value: loadingProgress.expectedTotalBytes != null
                                                ? loadingProgress.cumulativeBytesLoaded /
                                                    loadingProgress.expectedTotalBytes!
                                                : null,
                                          ),
                                          const SizedBox(height: 16),
                                          Text(
                                            'Loading image...',
                                            style: TextStyle(color: Colors.grey[600]),
                                          ),
                                        ],
                                      ),
                                    ),
                                  );
                                },
                                errorBuilder: (context, error, stackTrace) {
                                  return Container(
                                    color: Colors.grey[300],
                                    child: Center(
                                      child: Column(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          Icon(
                                            Icons.broken_image_rounded,
                                            size: 48,
                                            color: Colors.grey[600],
                                          ),
                                          const SizedBox(height: 12),
                                          Text(
                                            'Failed to load image',
                                            style: TextStyle(
                                              color: Colors.grey[600],
                                              fontSize: 14,
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            media.role.toUpperCase(),
                                            style: TextStyle(
                                              color: Colors.grey[500],
                                              fontSize: 12,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  );
                                },
                              ),
                            ),
                            
                            // Gradient overlay
                            Container(
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  begin: Alignment.topCenter,
                                  end: Alignment.bottomCenter,
                                  colors: [
                                    Colors.transparent,
                                    Colors.black.withOpacity(0.5),
                                  ],
                                  stops: const [0.6, 1.0],
                                ),
                              ),
                            ),
                            
                            // Role badge
                            Positioned(
                              bottom: 12,
                              left: 12,
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 6,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.black.withOpacity(0.8),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text(
                                  media.role.toUpperCase(),
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ),
                            
                            // Image counter
                            if (issue.media.length > 1)
                              Positioned(
                                top: 12,
                                right: 12,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.black.withOpacity(0.7),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(
                                    '${index + 1}/${issue.media.length}',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              )
            else
              Container(
                height: 200,
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      AppColors.primary.withOpacity(0.1),
                      AppColors.secondary.withOpacity(0.1),
                    ],
                  ),
                ),
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.photo_library_outlined,
                        size: 50,
                        color: AppColors.primary,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'No Evidence Photos',
                        style: TextStyle(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w500,
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

            Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Issue Header
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          color: _getStatusColor(issue.status).withOpacity(0.1),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          _getCategoryIcon(issue.category),
                          color: _getStatusColor(issue.status),
                          size: 24,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              issue.title,
                              style: const TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.bold,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            const SizedBox(height: 12),
                            // Fixed chips with proper wrapping
                            Wrap(
                              spacing: 8,
                              runSpacing: 6,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 6,
                                  ),
                                  decoration: BoxDecoration(
                                    color: _getStatusColor(issue.status).withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  child: Text(
                                    issue.status.name.toUpperCase(),
                                    style: TextStyle(
                                      color: _getStatusColor(issue.status),
                                      fontWeight: FontWeight.bold,
                                      fontSize: 11,
                                    ),
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 6,
                                  ),
                                  decoration: BoxDecoration(
                                    color: _getPriorityColor(issue.priority).withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  child: Text(
                                    '${_getPriorityText(issue.priority)} PRIORITY',
                                    style: TextStyle(
                                      color: _getPriorityColor(issue.priority),
                                      fontWeight: FontWeight.bold,
                                      fontSize: 11,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 24),

                  // Description
                  const Text(
                    'Description',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    issue.description,
                    style: const TextStyle(
                      fontSize: 16,
                      color: AppColors.textSecondary,
                      height: 1.5,
                    ),
                  ),

                  const SizedBox(height: 24),
                  const Divider(height: 1),
                  const SizedBox(height: 24),

                  // Status Timeline
                  const Text(
                    'Status Timeline',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Track the progress of your reported issue',
                    style: TextStyle(
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Timeline
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      children: List.generate(timelineEvents.length, (index) {
                        final event = timelineEvents[index];
                        return Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: TimelineTile(
                            title: event['status'] as String,
                            subtitle: event['by'] as String,
                            description: event['description'] as String,
                            time: '${_formatDate(event['time'] as DateTime)} • ${_formatTime(event['time'] as DateTime)}',
                            isFirst: index == 0,
                            isLast: index == timelineEvents.length - 1,
                            isCompleted: event['completed'] as bool,
                            isCurrent: index == timelineEvents.length - 1 && (event['completed'] as bool),
                          ),
                        );
                      }),
                    ),
                  ),

                  const SizedBox(height: 24),
                  const Divider(height: 1),
                  const SizedBox(height: 24),

                  // Issue Details
                  const Text(
                    'Issue Details',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 16),

                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        if (issue.coordinates.isNotEmpty)
                          _buildDetailRow(
                            icon: Icons.location_on_outlined,
                            title: 'Coordinates',
                            value: '${issue.coordinates[1].toStringAsFixed(6)}, ${issue.coordinates[0].toStringAsFixed(6)}',
                          ),
                        if (issue.coordinates.isNotEmpty) _buildDivider(),
                        _buildDetailRow(
                          icon: Icons.category_outlined,
                          title: 'Category',
                          value: issue.category.name.toUpperCase(),
                        ),
                        _buildDivider(),
                        _buildDetailRow(
                          icon: Icons.flag_outlined,
                          title: 'Priority Level',
                          value: '${_getPriorityText(issue.priority)} (${issue.priority}/10)',
                        ),
                        _buildDivider(),
                        _buildDetailRow(
                          icon: Icons.thumb_up_alt_outlined,
                          title: 'Community Support',
                          value: '${issue.upvoteCount} citizen${issue.upvoteCount != 1 ? 's' : ''} support${issue.upvoteCount == 1 ? 's' : ''} this',
                        ),
                        _buildDivider(),
                        _buildDetailRow(
                          icon: Icons.person_outlined,
                          title: 'Assigned Officer',
                          value: issue.assignedOfficerName ?? 'Officer #${issue.assignedOfficerId ?? 'Unassigned'}',
                        ),
                        _buildDivider(),
                        _buildDetailRow(
                          icon: Icons.phone_android_outlined,
                          title: 'Reported Via',
                          value: issue.channel.toUpperCase(),
                        ),
                        _buildDivider(),
                        _buildDetailRow(
                          icon: Icons.calendar_today_outlined,
                          title: 'Reported On',
                          value: '${_formatDate(issue.createdAt)} at ${_formatTime(issue.createdAt)}',
                        ),
                        _buildDivider(),
                        _buildDetailRow(
                          icon: Icons.timer_outlined,
                          title: 'SLA Due Date',
                          value: '${_formatDate(issue.slaDueDate)} at ${_formatTime(issue.slaDueDate)}',
                          isUrgent: issue.slaDueDate.isBefore(DateTime.now().add(const Duration(days: 1))),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 32),

                  // Action Buttons
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          icon: const Icon(Icons.thumb_up, size: 20),
                          label: Text('Upvote (${issue.upvoteCount})'),
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Thanks for your support!'),
                                duration: Duration(seconds: 2),
                              ),
                            );
                          },
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton.icon(
                          icon: const Icon(Icons.share, size: 20),
                          label: const Text('Share'),
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Issue shared successfully!'),
                                duration: Duration(seconds: 2),
                              ),
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  // Additional Actions for certain statuses
                  if (issue.status == IssueStatus.resolved || issue.status == IssueStatus.closed)
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        icon: const Icon(Icons.rate_review, size: 20),
                        label: const Text('Rate Resolution'),
                        onPressed: () {
                          // Handle rating action
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow({
    required IconData icon,
    required String title,
    required String value,
    bool isUrgent = false,
  }) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, size: 16, color: AppColors.primary),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontWeight: FontWeight.w500,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: TextStyle(
                    color: isUrgent ? Colors.red : AppColors.textSecondary,
                    fontWeight: isUrgent ? FontWeight.bold : FontWeight.normal,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDivider() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Divider(
        height: 1,
        thickness: 1,
        color: Colors.grey.shade100,
      ),
    );
  }
}