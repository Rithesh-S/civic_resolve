import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:municipal_officer_app/core/theme.dart';
import 'package:municipal_officer_app/features/auth/bloc/auth_bloc.dart';
import 'package:municipal_officer_app/features/auth/ui/login_page.dart';
import 'package:municipal_officer_app/features/extensions/bloc/extension_bloc.dart';
import 'package:municipal_officer_app/features/inventory/bloc/inventory_bloc.dart';
import 'package:municipal_officer_app/features/issues/bloc/issues_bloc.dart';
import 'package:municipal_officer_app/features/notifications/bloc/notification_bloc.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (context) => AuthBloc()),
        BlocProvider(create: (context) => IssuesBloc()),
        BlocProvider(create: (context) => InventoryBloc()),
        BlocProvider(create: (context) => ExtensionBloc()),
        BlocProvider(create: (context) => NotificationBloc()),
      ],
      child: MaterialApp(
        title: 'Municipal Officer App',
        theme: AppTheme.lightTheme,
        debugShowCheckedModeBanner: false,
        home: const LoginPage(),
      ),
    );
  }
}