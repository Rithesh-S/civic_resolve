// lib/screens/citizen/dashboard/citizen_main_dashboard_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_application_2/screens/citizen/dashboard/tabs/map_view_screen.dart';
import 'package:flutter_application_2/screens/citizen/dashboard/tabs/my_issues_screen.dart';
import 'package:flutter_application_2/screens/citizen/dashboard/tabs/profile_screen.dart';
import 'package:flutter_application_2/screens/citizen/notifications/notifications_history_screen.dart';
import 'package:flutter_application_2/utils/colors.dart';
// FIX: Import ApiService and remove dummy data service
import 'package:flutter_application_2/services/api_service.dart';

class CitizenMainDashboardScreen extends StatefulWidget {
  const CitizenMainDashboardScreen({super.key});

  @override
  State<CitizenMainDashboardScreen> createState() =>
      _CitizenMainDashboardScreenState();
}

class _CitizenMainDashboardScreenState
    extends State<CitizenMainDashboardScreen> {
  int _selectedIndex = 1;
  final PageController _pageController = PageController(initialPage: 1);
  int _unreadNotifications = 0;

  // FIX: Add instance of ApiService
  final ApiService _apiService = ApiService();

  final List<Widget> _screens = [
    const MapViewScreen(),
    const MyIssuesScreen(),
    const ProfileScreen(),
  ];

  final List<String> _appBarTitles = const [
    'Civic Issues Map',
    'My Reported Issues',
    'My Profile'
  ];

  @override
  void initState() {
    super.initState();
    // FIX: Fetch unread count from the API instead of dummy data
    _fetchUnreadCount();
  }

  // FIX: New method to fetch unread count from the API
  Future<void> _fetchUnreadCount() async {
    try {
      // The API returns the total unreadCount in the response.
      // Fetching just 1 item is an efficient way to get this count.
      final response = await _apiService.getNotifications(page: 1, limit: 1);
      if (mounted) {
        setState(() {
          _unreadNotifications = response['unreadCount'];
        });
      }
    } catch (e) {
      debugPrint("Failed to fetch unread notification count: $e");
      if (mounted) {
        setState(() {
          _unreadNotifications = 0;
        });
      }
    }
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
      _pageController.jumpToPage(index);
    });
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_appBarTitles[_selectedIndex]),
        centerTitle: true,
        actions: [
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.notifications_outlined),
                onPressed: () async {
                  // FIX: Wait for the notifications screen to be closed
                  // and then refresh the count.
                  await Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => const NotificationsHistoryScreen(),
                    ),
                  );
                  // Refresh the count when returning from the notifications screen
                  _fetchUnreadCount();
                },
                tooltip: 'Notifications',
              ),
              if (_unreadNotifications > 0)
                Positioned(
                  right: 8,
                  top: 8,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: Colors.red,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    constraints: const BoxConstraints(
                      minWidth: 18,
                      minHeight: 18,
                    ),
                    child: Text(
                      _unreadNotifications > 9
                          ? '9+'
                          : _unreadNotifications.toString(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
      body: PageView(
        controller: _pageController,
        onPageChanged: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        children: _screens,
      ),
      bottomNavigationBar:
          _buildCustomBottomNav(), // Extracted to a method for clarity
    );
  }

  // The bottom navigation bar widget, extracted for readability
  Widget _buildCustomBottomNav() {
    return Container(
      height: 80,
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildNavItem(
              icon: Icons.map_outlined,
              activeIcon: Icons.map,
              label: 'Map',
              index: 0),
          _buildFabNavItem(),
          _buildNavItem(
              icon: Icons.person_outline,
              activeIcon: Icons.person,
              label: 'Profile',
              index: 2),
        ],
      ),
    );
  }

  Widget _buildNavItem(
      {required IconData icon,
      required IconData activeIcon,
      required String label,
      required int index}) {
    final isSelected = _selectedIndex == index;
    return Expanded(
      child: InkWell(
        onTap: () => _onItemTapped(index),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              isSelected ? activeIcon : icon,
              size: 28,
              color: isSelected
                  ? AppColors.primary
                  : AppColors.textSecondary.withOpacity(0.7),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                color: isSelected
                    ? AppColors.primary
                    : AppColors.textSecondary.withOpacity(0.7),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFabNavItem() {
    final isSelected = _selectedIndex == 1;
    return Container(
      width: 70,
      height: 70, // Ensure the container is large enough for the tap area
      margin: const EdgeInsets.only(bottom: 10),
      child: InkWell(
        onTap: () => _onItemTapped(1),
        customBorder: const CircleBorder(),
        child: Container(
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: AppColors.primaryGradient,
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withOpacity(0.4),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Icon(
            isSelected ? Icons.list_alt : Icons.list_alt_outlined,
            size: 30,
            color: Colors.white,
          ),
        ),
      ),
    );
  }
}