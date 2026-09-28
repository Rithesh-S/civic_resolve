// lib/screens/notifications_history_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_application_2/models/notification_model.dart';
import 'package:flutter_application_2/services/api_service.dart';
import 'package:flutter_application_2/utils/colors.dart';
import 'package:flutter_application_2/widgets/notification_card.dart';

class NotificationsHistoryScreen extends StatefulWidget {
  const NotificationsHistoryScreen({super.key});

  @override
  State<NotificationsHistoryScreen> createState() =>
      _NotificationsHistoryScreenState();
}

class _NotificationsHistoryScreenState
    extends State<NotificationsHistoryScreen> {
  final ApiService _apiService = ApiService();
  final ScrollController _scrollController = ScrollController();

  // State variables for data, pagination, and UI
  List<AppNotification> _notifications = [];
  int _currentPage = 1;
  int _totalPages = 1;
  int _unreadCount = 0;
  bool _isLoading = false;
  bool _isFirstLoad = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchData(isRefresh: true);

    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    // Load next page when user reaches near the end of the list
    if (_scrollController.position.pixels >=
            _scrollController.position.maxScrollExtent * 0.95 &&
        !_isLoading) {
      if (_currentPage < _totalPages) {
        _currentPage++;
        _fetchData();
      }
    }
  }

  Future<void> _fetchData({bool isRefresh = false}) async {
    if (_isLoading) return;
    setState(() {
      _isLoading = true;
      if (isRefresh) {
        _isFirstLoad = true;
        _notifications.clear();
        _currentPage = 1;
      }
    });

    try {
      final response = await _apiService.getNotifications(page: _currentPage);
      final List<AppNotification> fetched = response['notifications'];
      final pagination = response['pagination'];

      setState(() {
        _notifications.addAll(fetched);
        _totalPages = pagination['pages'] ?? 1;
        _unreadCount = response['unreadCount'] ?? 0;
        _error = null;
      });
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() {
        _isLoading = false;
        _isFirstLoad = false;
      });
    }
  }

  Future<void> _markAllAsRead() async {
    try {
      await _apiService.markAllNotificationsAsRead();
      setState(() {
        for (var n in _notifications) {
          n.isRead = true;
        }
        _unreadCount = 0;
      });
      _showSnackBar('All notifications marked as read');
    } catch (e) {
      _showSnackBar(e.toString(), isError: true);
    }
  }

  Future<void> _deleteNotification(String id) async {
    final index = _notifications.indexWhere((n) => n.id == id);
    if (index == -1) return;
    final toRemove = _notifications[index];

    // Optimistic UI update
    setState(() {
      _notifications.removeAt(index);
      if (!toRemove.isRead) _unreadCount--;
    });

    try {
      await _apiService.deleteNotification(id);
    } catch (e) {
      _showSnackBar('Failed to delete: ${e.toString()}', isError: true);
      // Revert on error
      setState(() {
        _notifications.insert(index, toRemove);
        if (!toRemove.isRead) _unreadCount++;
      });
    }
  }

  Future<void> _markOneAsRead(AppNotification notification) async {
    if (notification.isRead) return;

    // Optimistic UI update
    setState(() {
      notification.isRead = true;
      _unreadCount--;
    });

    try {
      await _apiService.markNotificationAsRead(notification.id);
    } catch (e) {
      _showSnackBar('Failed to update: ${e.toString()}', isError: true);
      // Revert on error
      setState(() {
        notification.isRead = false;
        _unreadCount++;
      });
    }
  }

  void _showSnackBar(String message, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? Colors.redAccent : AppColors.primary,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        centerTitle: true,
        actions: [
          if (_notifications.isNotEmpty)
            PopupMenuButton(
              onSelected: (_) => _markAllAsRead(),
              itemBuilder: (context) => [
                const PopupMenuItem(
                  value: 'mark_all',
                  child: Text('Mark all as read'),
                ),
              ],
            ),
        ],
      ),
      body: _buildContent(),
    );
  }

  Widget _buildContent() {
    if (_isFirstLoad && _isLoading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_error != null && _notifications.isEmpty) {
      return Center(child: Text('Error: $_error'));
    }
    if (_notifications.isEmpty) {
      return _buildEmptyState();
    }

    return Column(
      children: [
        if (_unreadCount > 0)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            color: AppColors.primary.withOpacity(0.1),
            child: Row(
              children: [
                Icon(Icons.circle, size: 12, color: AppColors.primary),
                const SizedBox(width: 8),
                Text(
                  '$_unreadCount unread notification${_unreadCount > 1 ? 's' : ''}',
                  style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600),
                ),
                const Spacer(),
                TextButton(
                  onPressed: _markAllAsRead,
                  child: Text('MARK ALL READ', style: TextStyle(color: AppColors.primary, fontSize: 12, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),
        Expanded(
          child: RefreshIndicator(
            onRefresh: () => _fetchData(isRefresh: true),
            child: ListView.builder(
              controller: _scrollController,
              itemCount: _notifications.length + (_isLoading ? 1 : 0),
              itemBuilder: (context, index) {
                if (index == _notifications.length) {
                  return const Center(child: Padding(padding: EdgeInsets.all(16.0), child: CircularProgressIndicator()));
                }
                final notification = _notifications[index];
                return NotificationCard(
                  notification: notification,
                  onTap: () => _markOneAsRead(notification),
                  onDismiss: () => _deleteNotification(notification.id),
                );
              },
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.notifications_off_outlined, size: 60, color: Colors.grey.shade300),
          const SizedBox(height: 16),
          Text('No notifications yet', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.grey.shade500)),
          const SizedBox(height: 8),
          Text('You\'ll see notifications here when you get them', style: TextStyle(color: Colors.grey.shade400), textAlign: TextAlign.center),
        ],
      ),
    );
  }
}