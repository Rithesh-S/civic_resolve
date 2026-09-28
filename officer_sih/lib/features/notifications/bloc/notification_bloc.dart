import 'dart:convert';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:municipal_officer_app/features/notifications/bloc/notification_event.dart';
import 'package:municipal_officer_app/features/notifications/bloc/notification_state.dart';
import 'package:municipal_officer_app/features/notifications/models/notification_model.dart';

class NotificationBloc extends Bloc<NotificationEvent, NotificationState> {
  final String _baseUrl = 'http://10.223.140.88:5000/api'; // Your base URL
  final _storage = const FlutterSecureStorage();

  NotificationBloc() : super(NotificationInitial()) {
    // --- FETCH NOTIFICATIONS ---
    on<FetchNotifications>((event, emit) async {
      emit(NotificationLoading());
      try {
        final token = await _storage.read(key: 'userId');
        final response = await http.get(
          Uri.parse('$_baseUrl/notifications'),
          headers: {'x-user-id': '$token'},
        );
        if (response.statusCode == 200) {
          final data = json.decode(response.body);
          final notifications = (data['notifications'] as List)
              .map((n) => Notification.fromJson(n))
              .toList();
          final unreadCount = data['unreadCount'] as int;
          emit(NotificationLoaded(notifications, unreadCount: unreadCount));
        } else {
          throw Exception('Failed to load notifications');
        }
      } catch (e) {
        emit(NotificationError(e.toString()));
      }
    });

    // --- MARK ONE AS READ ---
    on<MarkOneAsRead>((event, emit) async {
      if (state is NotificationLoaded) {
        final loadedState = state as NotificationLoaded;
        final originalNotifications =
            List<Notification>.from(loadedState.notifications);

        // Optimistic UI update
        final updatedNotifications = originalNotifications.map((n) {
          return n.id == event.notificationId ? n.copyWith(isRead: true) : n;
        }).toList();
        final newUnreadCount =
            updatedNotifications.where((n) => !n.isRead).length;
        emit(NotificationLoaded(updatedNotifications,
            unreadCount: newUnreadCount));

        // API Call
        try {
          final token = await _storage.read(key: 'userId');
          print(event.notificationId);
          await http.patch(
            Uri.parse('$_baseUrl/notifications/${event.notificationId}/read'),
            headers: {'x-user-id': '$token'},
          );
        } catch (e) {
          // Rollback on failure
          print(e);
          emit(loadedState);
        }
      }
    });

    // --- MARK ALL AS READ ---
    on<MarkAllAsRead>((event, emit) async {
      if (state is NotificationLoaded) {
        final loadedState = state as NotificationLoaded;
        // Optimistic UI update
        final updatedNotifications = loadedState.notifications
            .map((n) => n.copyWith(isRead: true))
            .toList();
        emit(NotificationLoaded(updatedNotifications, unreadCount: 0));

        // API Call
        try {
          final token = await _storage.read(key: 'userId');
          await http.patch(
            Uri.parse('$_baseUrl/notifications/read-all'),
            headers: {'x-user-id': '$token'},
          );
        } catch (e) {
          // Rollback on failure
          emit(loadedState);
        }
      }
    });

    // --- DELETE NOTIFICATION ---
    on<DeleteNotification>((event, emit) async {
      if (state is NotificationLoaded) {
        final loadedState = state as NotificationLoaded;
        final originalNotifications =
            List<Notification>.from(loadedState.notifications);

        // Optimistic UI update
        final updatedNotifications = originalNotifications
          ..removeWhere((n) => n.id == event.notificationId);
        final newUnreadCount =
            updatedNotifications.where((n) => !n.isRead).length;
        emit(NotificationLoaded(updatedNotifications,
            unreadCount: newUnreadCount));

        // API Call
        try {
          final token = await _storage.read(key: 'userId');
          await http.delete(
            Uri.parse('$_baseUrl/notifications/${event.notificationId}'),
            headers: {'x-user-id': '$token'},
          );
        } catch (e) {
          // Rollback on failure
          emit(loadedState);
        }
      }
    });
  }
}
