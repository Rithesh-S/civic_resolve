import 'package:equatable/equatable.dart';
import 'package:municipal_officer_app/features/extensions/models/extension_request_model.dart';

abstract class ExtensionState extends Equatable {
  const ExtensionState();
  @override
  List<Object> get props => [];
}

class ExtensionInitial extends ExtensionState {}

class ExtensionSubmitSuccess extends ExtensionState {}

class ExtensionSubmitting extends ExtensionState {}

class ExtensionSubmitFailure extends ExtensionState {
  final String error;
  const ExtensionSubmitFailure(this.error);
  @override
  List<Object> get props => [error];
}

class ExtensionLoaded extends ExtensionState {
  final List<ExtensionRequest> requests;
  const ExtensionLoaded(this.requests);
  @override
  List<Object> get props => [requests];
}