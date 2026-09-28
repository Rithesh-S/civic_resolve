import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:municipal_officer_app/core/theme.dart';
import 'package:municipal_officer_app/features/notifications/bloc/notification_bloc.dart';
import 'package:municipal_officer_app/features/notifications/bloc/notification_event.dart';
import 'package:municipal_officer_app/features/notifications/bloc/notification_state.dart';
import 'package:municipal_officer_app/features/notifications/models/notification_model.dart'
    as model;
import 'package:municipal_officer_app/features/notifications/models/notification_model.dart';

class NotificationPage extends StatefulWidget {
  const NotificationPage({super.key});

  @override
  State<NotificationPage> createState() => _NotificationPageState();
}

class _NotificationPageState extends State<NotificationPage> {
  @override
  void initState() {
    super.initState();
    if (context.read<NotificationBloc>().state is! NotificationLoaded) {
      context.read<NotificationBloc>().add(FetchNotifications());
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text("Notifications"),
        backgroundColor: AppTheme.background,
        elevation: 0.5,
        actions: [
          IconButton(
            icon: const Icon(CupertinoIcons.refresh),
            tooltip: 'Refresh Notifications',
            onPressed: () {
              context.read<NotificationBloc>().add(FetchNotifications());
            },
          ),
          BlocBuilder<NotificationBloc, NotificationState>(
            builder: (context, state) {
              if (state is NotificationLoaded &&
                  state.notifications.any((n) => !n.isRead)) {
                return TextButton(
                  onPressed: () =>
                      context.read<NotificationBloc>().add(MarkAllAsRead()),
                  child: const Text("Mark all as read"),
                );
              }
              return const SizedBox.shrink();
            },
          ),
        ],
      ),
      body: BlocBuilder<NotificationBloc, NotificationState>(
        builder: (context, state) {
          return AnimatedSwitcher(
            duration: const Duration(milliseconds: 300),
            child: _buildBody(state),
          );
        },
      ),
    );
  }

  // --- Helper to build the body based on state ---
  Widget _buildBody(NotificationState state) {
    if (state is NotificationLoading || state is NotificationInitial) {
      return const Center(
          key: ValueKey('loading'), child: CircularProgressIndicator());
    }
    if (state is NotificationLoaded) {
      if (state.notifications.isEmpty) {
        return _buildEmptyState();
      }
      return _buildNotificationList(state.notifications);
    }
    return const Center(
        key: ValueKey('error'), child: Text("Something went wrong."));
  }

  // --- A more engaging empty state UI ---
  Widget _buildEmptyState() {
    return Center(
      key: const ValueKey('empty'),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(CupertinoIcons.bell_slash,
              size: 80, color: Colors.grey.shade300),
          const SizedBox(height: 24),
          Text(
            "No Notifications Yet",
            style: GoogleFonts.inter(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: AppTheme.primaryDark),
          ),
          const SizedBox(height: 8),
          Text(
            "Important updates will appear here.",
            style: TextStyle(fontSize: 16, color: Colors.grey.shade500),
          ),
        ],
      ),
    );
  }

  // --- The main list of notifications ---
  Widget _buildNotificationList(List<model.Notification> notifications) {
    return ListView.builder(
      key: const ValueKey('list'),
      padding: const EdgeInsets.all(8),
      itemCount: notifications.length,
      itemBuilder: (context, index) {
        final notification = notifications[index];
        return _buildNotificationTile(notification);
      },
    );
  }

  // --- Redesigned, card-based notification tile ---
  Widget _buildNotificationTile(model.Notification notification) {
    final appearance = _getNotificationAppearance(notification.type);
    final isUnread = !notification.isRead;

    // ✅ WRAP a Dismissible widget around the Card
    return Dismissible(
        key: ValueKey(notification.id),
        direction: DismissDirection.endToStart,
        // ✅ DISPATCH the delete event
        onDismissed: (direction) {
          context
              .read<NotificationBloc>()
              .add(DeleteNotification(notification.id));
          ScaffoldMessenger.of(context)
            ..removeCurrentSnackBar()
            ..showSnackBar(
                const SnackBar(content: Text("Notification deleted")));
        },
        // ✅ ADD a background that shows on swipe
        background: Container(
          decoration: BoxDecoration(
            color: Colors.red.shade700,
            borderRadius: BorderRadius.circular(12),
          ),
          margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
          padding: const EdgeInsets.symmetric(horizontal: 20),
          alignment: Alignment.centerRight,
          child: const Icon(CupertinoIcons.delete, color: Colors.white),
        ),
        child: Card(
          elevation: isUnread ? 2.0 : 0.5,
          margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: BorderSide(
                color: isUnread
                    ? AppTheme.accentBlue.withOpacity(0.5)
                    : Colors.grey.shade200,
                width: 1),
          ),
          color:
              isUnread ? AppTheme.accentBlue.withOpacity(0.03) : Colors.white,
          child: InkWell(
            borderRadius: BorderRadius.circular(12),
            onTap: () {
              if (isUnread) {
                context
                    .read<NotificationBloc>()
                    .add(MarkOneAsRead(notification.id));
              }
            },
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  CircleAvatar(
                    backgroundColor: appearance['color'].withOpacity(0.15),
                    child: Icon(appearance['icon'],
                        color: appearance['color'], size: 22),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          notification.title,
                          style: GoogleFonts.inter(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                              color: AppTheme.primaryDark),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          notification.message,
                          style: TextStyle(
                              color: Colors.grey.shade700,
                              fontSize: 14,
                              height: 1.4),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          DateFormat('d MMM, h:mm a')
                              .format(notification.createdAt),
                          style: TextStyle(
                              color: Colors.grey.shade500, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                  if (isUnread)
                    Container(
                      margin: const EdgeInsets.only(left: 12),
                      width: 10,
                      height: 10,
                      decoration: const BoxDecoration(
                        color: AppTheme.accentBlue,
                        shape: BoxShape.circle,
                      ),
                    )
                ],
              ),
            ),
          ),
        ));
  }

  // Helper to get color and icon (no changes needed)
  Map<String, dynamic> _getNotificationAppearance(model.NotificationType type) {
    switch (type) {
      case NotificationType.newAssignment:
        return {
          'color': AppTheme.accentBlue,
          'icon': CupertinoIcons.doc_text_search
        };
      case NotificationType.requestApproved:
        return {
          'color': Colors.green,
          'icon': CupertinoIcons.checkmark_seal_fill
        };
      case NotificationType.requestRejected:
        return {'color': Colors.red, 'icon': CupertinoIcons.xmark_seal_fill};
      case NotificationType.slaWarning:
        return {
          'color': Colors.orange,
          'icon': CupertinoIcons.exclamationmark_triangle_fill
        };
      case NotificationType.unknown:
        return {
          'color': Colors.grey.shade600,
          'icon': CupertinoIcons.info_circle_fill
        };
    }
  }
}
