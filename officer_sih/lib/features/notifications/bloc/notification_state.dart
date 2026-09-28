import 'package:equatable/equatable.dart';
import 'package:municipal_officer_app/features/notifications/models/notification_model.dart';

abstract class NotificationState extends Equatable {
  const NotificationState();
  @override
  List<Object> get props => [];
}

class NotificationInitial extends NotificationState {}

class NotificationLoading extends NotificationState {}

class NotificationError extends NotificationState {
  final String message;
  const NotificationError(this.message);
  @override
  List<Object> get props => [message];
}

class NotificationLoaded extends NotificationState {
  final List<Notification> notifications;
  final int unreadCount;
  const NotificationLoaded(this.notifications, {required this.unreadCount});
  @override
  List<Object> get props => [notifications, unreadCount];
}
