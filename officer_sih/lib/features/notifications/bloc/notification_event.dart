import 'package:equatable/equatable.dart';

abstract class NotificationEvent extends Equatable {
  const NotificationEvent();
  @override
  List<Object> get props => [];
}

class FetchNotifications extends NotificationEvent {}

class MarkAllAsRead extends NotificationEvent {}

class MarkOneAsRead extends NotificationEvent {
  final String notificationId;
  const MarkOneAsRead(this.notificationId);
  @override
  List<Object> get props => [notificationId];
}

class DeleteNotification extends NotificationEvent {
  final String notificationId;
  const DeleteNotification(this.notificationId);
  @override
  List<Object> get props => [notificationId];
}