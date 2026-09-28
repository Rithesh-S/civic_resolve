import 'package:flutter/material.dart';
import 'package:flutter_application_2/utils/colors.dart';

class TimelineTile extends StatelessWidget {
  final String title;
  final String subtitle;
  final String description;
  final String time;
  final bool isFirst;
  final bool isLast;
  final bool isCompleted;
  final bool isCurrent;

  const TimelineTile({
    super.key,
    required this.title,
    required this.subtitle,
    required this.description,
    required this.time,
    this.isFirst = false,
    this.isLast = false,
    this.isCompleted = true,
    this.isCurrent = false,
  });

  @override
  Widget build(BuildContext context) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // The timeline connector with dot/icon
          _buildTimelineConnector(),
          const SizedBox(width: 16),
          // The content
          Expanded(
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          title,
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                            color: isCurrent ? AppColors.primary : AppColors.textPrimary,
                          ),
                        ),
                      ),
                      Text(
                        time,
                        style: TextStyle(
                          color: isCompleted ? AppColors.textSecondary : Colors.grey.shade400,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: TextStyle(
                      color: isCompleted ? AppColors.textSecondary : Colors.grey.shade400,
                      fontSize: 14,
                    ),
                  ),
                  if (description.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Text(
                      description,
                      style: TextStyle(
                        color: isCompleted ? AppColors.textSecondary.withOpacity(0.8) : Colors.grey.shade400,
                        fontSize: 13,
                        height: 1.4,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineConnector() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Top line
        Container(
          width: 2,
          height: 10,
          color: isFirst ? Colors.transparent : Colors.grey.shade300,
        ),
        // Dot/Icon with different states
        Container(
          width: 24,
          height: 24,
          decoration: BoxDecoration(
            color: isCurrent 
                ? AppColors.primary 
                : isCompleted 
                  ? AppColors.primary.withOpacity(0.1)
                  : Colors.grey.shade200,
            shape: BoxShape.circle,
            border: Border.all(
              color: isCurrent 
                  ? AppColors.primary 
                  : isCompleted 
                    ? AppColors.primary
                    : Colors.grey.shade400,
              width: isCurrent ? 3 : 2,
            ),
          ),
          child: Icon(
            isCurrent ? Icons.access_time : Icons.check,
            size: 14,
            color: isCurrent 
                ? Colors.white 
                : isCompleted 
                  ? AppColors.primary
                  : Colors.grey.shade400,
          ),
        ),
        // Bottom line
        Expanded(
          child: Container(
            width: 2,
            color: isLast ? Colors.transparent : Colors.grey.shade300,
          ),
        ),
      ],
    );
  }
}