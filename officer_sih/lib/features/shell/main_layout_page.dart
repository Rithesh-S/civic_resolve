import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_nav_bar/google_nav_bar.dart';
import 'package:municipal_officer_app/core/theme.dart';
import 'package:municipal_officer_app/features/auth/bloc/auth_bloc.dart';
import 'package:municipal_officer_app/features/auth/bloc/auth_state.dart';
import 'package:municipal_officer_app/features/auth/ui/login_page.dart';
import 'package:municipal_officer_app/features/dashboard/ui/dashboard_page.dart';
import 'package:municipal_officer_app/features/issues/ui/issues_hub_page.dart';
import 'package:municipal_officer_app/features/profile/ui/profile_page.dart';

class MainLayoutPage extends StatefulWidget {
  const MainLayoutPage({super.key});

  @override
  State<MainLayoutPage> createState() => _MainLayoutPageState();
}

class _MainLayoutPageState extends State<MainLayoutPage> {
  int _selectedIndex = 0;
  // Controller to manage page transitions in the PageView
  final PageController _pageController = PageController();

  static final List<Widget> _widgetOptions = <Widget>[
    const DashboardPage(),
    const IssuesHubPage(),
    const ProfilePage(),
  ];

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is AuthLoggedOut) {
          Navigator.of(context).pushAndRemoveUntil(
            MaterialPageRoute(builder: (_) => const LoginPage()),
            (route) => false,
          );
        }
      },
      child: Scaffold(
        // Use PageView for swipeable transitions
        body: PageView(
          controller: _pageController,
          onPageChanged: (index) {
            setState(() {
              _selectedIndex = index;
            });
          },
          children: _widgetOptions,
        ),
        // Stylish floating navigation bar
        bottomNavigationBar: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                blurRadius: 20,
                color: Colors.black.withOpacity(.1),
              )
            ],
          ),
          child: SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 15.0, vertical: 8),
              child: GNav(
                rippleColor: AppTheme.accentBlue.withOpacity(0.1),
                hoverColor: AppTheme.accentBlue.withOpacity(0.05),
                gap: 8,
                activeColor: Colors.white,
                iconSize: 24,
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                duration: const Duration(milliseconds: 400),
                tabBackgroundColor: AppTheme.accentBlue,
                color: AppTheme.textSubtle,
                tabs: const [
                  GButton(
                    icon: CupertinoIcons.home,
                    text: 'Dashboard',
                  ),
                  GButton(
                    icon: CupertinoIcons.map_pin_ellipse,
                    text: 'Issues',
                  ),
                  GButton(
                    icon: CupertinoIcons.person,
                    text: 'Profile',
                  ),
                ],
                selectedIndex: _selectedIndex,
                onTabChange: (index) {
                  setState(() {
                    _selectedIndex = index;
                  });
                  // Animate to the page when a tab is tapped
                  _pageController.animateToPage(
                    index,
                    duration: const Duration(milliseconds: 300),
                    curve: Curves.easeInOut,
                  );
                },
              ),
            ),
          ),
        ),
      ),
    );
  }
}