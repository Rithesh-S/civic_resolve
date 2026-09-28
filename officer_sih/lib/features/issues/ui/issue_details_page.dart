import 'dart:convert';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import 'package:municipal_officer_app/core/theme.dart';
import 'package:municipal_officer_app/features/extensions/bloc/extension_bloc.dart';
import 'package:municipal_officer_app/features/extensions/bloc/extension_event.dart';
import 'package:municipal_officer_app/features/extensions/bloc/extension_state.dart';
import 'package:municipal_officer_app/features/extensions/models/extension_request_model.dart';
import 'package:municipal_officer_app/features/inventory/bloc/inventory_bloc.dart';
import 'package:municipal_officer_app/features/inventory/bloc/inventory_event.dart';
import 'package:municipal_officer_app/features/inventory/bloc/inventory_state.dart';
import 'package:municipal_officer_app/features/inventory/models/expense_request_model.dart';
import 'package:municipal_officer_app/features/inventory/ui/order_inventory_page.dart';
import 'package:municipal_officer_app/features/issues/bloc/issues_bloc.dart';
import 'package:municipal_officer_app/features/issues/bloc/issues_event.dart';
import 'package:municipal_officer_app/features/issues/bloc/issues_state.dart';
import 'package:municipal_officer_app/features/issues/models/issue_model.dart';
import 'package:municipal_officer_app/features/issues/ui/extension_request_page.dart';
import 'package:url_launcher/url_launcher.dart';

class IssueDetailsPage extends StatefulWidget {
  final String issueId;
  const IssueDetailsPage({super.key, required this.issueId});

  @override
  State<IssueDetailsPage> createState() => _IssueDetailsPageState();
}

class _IssueDetailsPageState extends State<IssueDetailsPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _showMapOverlay = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    if (context.read<InventoryBloc>().state is! InventoryLoaded) {
      context.read<InventoryBloc>().add(FetchInventoryData());
    }
    if (context.read<ExtensionBloc>().state is! ExtensionLoaded) {
      context.read<ExtensionBloc>().add(FetchExtensionRequests());
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocSelector<IssuesBloc, IssuesState, Issue?>(
      selector: (state) {
        // Safely find the issue without crashing if the state is not `IssuesLoaded`
        if (state is IssuesLoaded) {
          try {
            return state.issues.firstWhere((i) => i.id == widget.issueId);
          } catch (e) {
            return null; // Issue not found
          }
        }
        return null; // State is not loaded yet
      },
      builder: (context, issue) {
        // Handle cases where the issue is still loading or not found
        if (issue == null) {
          return const Scaffold(
            body: Center(
              child: CircularProgressIndicator(),
            ),
          );
        }

        return Scaffold(
          backgroundColor: AppTheme.background,
          body: NestedScrollView(
            headerSliverBuilder:
                (BuildContext context, bool innerBoxIsScrolled) {
              return <Widget>[
                SliverAppBar(
                  expandedHeight: 170.0,
                  floating: false,
                  pinned: true,
                  stretch: true,
                  backgroundColor: AppTheme.primaryDark,
                  flexibleSpace: FlexibleSpaceBar(
                    centerTitle: true,
                    titlePadding:
                        const EdgeInsets.symmetric(horizontal: 30, vertical: 8),
                    background: Stack(
                        // --- MODIFICATION --- Use a stack for image background
                        fit: StackFit.expand,
                        children: [
                          Container(
                            padding: const EdgeInsets.only(
                                bottom: 70, left: 16, right: 16),
                            alignment: Alignment.bottomLeft,
                            decoration: const BoxDecoration(
                              gradient: LinearGradient(
                                colors: [
                                  AppTheme.primaryDark,
                                  AppTheme.accentBlue
                                ],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                            ),
                            child: Text(
                              issue.title,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.inter(
                                  color: Colors.white,
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold),
                            ),
                          ),
                        ]),
                  ),
                  bottom: TabBar(
                    controller: _tabController,
                    unselectedLabelColor: Colors.white,
                    labelStyle: GoogleFonts.inter(
                        color: const Color.fromARGB(255, 107, 154, 255),
                        fontWeight: FontWeight.bold),
                    tabs: const [
                      Tab(text: "DETAILS"),
                      Tab(text: "ORDER STATUS"),
                    ],
                  ),
                ),
              ];
            },
            body: TabBarView(
              controller: _tabController,
              children: [
                _buildDetailsTab(context, issue),
                _buildOrderStatusTab(context, issue),
              ],
            ),
          ),
          bottomNavigationBar: _buildActionButtons(context, issue),
        );
      },
    );
  }

  // --- Tab Content Widgets ---

  Widget _buildDetailsTab(BuildContext context, Issue issue) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildExtensionStatusBanner(context, issue),
          _buildSectionCard(
            icon: Icons.info_outline,
            title: "Information",
            children: [
              Wrap(
                spacing: 8.0,
                runSpacing: 8.0,
                children: [
                  _buildStatusChip(issue),
                  _buildPriorityChip(issue),
                ],
              ),
              const SizedBox(height: 16),
              _buildInfoRow(
                  icon: CupertinoIcons.tag,
                  title: "Category",
                  value: issue.category),
              _buildInfoRow(
                  icon: CupertinoIcons.calendar,
                  title: "SLA Due Date",
                  // Add null check here to prevent crashes
                  value: issue.slaDueDate != null
                      ? DateFormat('dd MMM, yyyy').format(issue.slaDueDate!)
                      : 'N/A',
                  isOverdue: _isOverdue(issue)),
            ],
          ),
          if (issue.media.isNotEmpty) ...[
            const SizedBox(height: 16),
            _buildSectionCard(
              icon: CupertinoIcons.photo_on_rectangle,
              title: "Evidence",
              children: [
                SizedBox(
                  height: 100,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: issue.media.length,
                    itemBuilder: (context, index) {
                      final media = issue.media[index];
                      if (media.type != 'image') return const SizedBox.shrink();
                      return GestureDetector(
                        onTap: () {
                          // Call the function to show the popup
                          _showImagePopup(
                              context, "http://10.223.140.88:5000${media.url}");
                        },
                        child: Padding(
                          // Your existing Padding widget
                          padding: const EdgeInsets.only(right: 8.0),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Image.network(
                              "http://10.223.140.88:5000${media.url}",
                              width: 100,
                              height: 100,
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) =>
                                  Container(
                                color: Colors.grey.shade200,
                                width: 100,
                                height: 100,
                                child: const Icon(Icons.error),
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                )
              ],
            ),
          ],
          const SizedBox(height: 16),
          _buildSectionCard(
            icon: Icons.description_outlined,
            title: "Description",
            children: [
              Text(
                issue.description ?? 'No description provided.',
                style: const TextStyle(
                    fontSize: 15, color: AppTheme.textSubtle, height: 1.5),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _buildSectionCard(
            icon: Icons.location_on_outlined,
            title: "Location",
            children: [
              SizedBox(
                height: 200,
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  // Use a Stack to overlay buttons on the map
                  child: Stack(
                    children: [
                      // Map is now wrapped in a GestureDetector
                      FlutterMap(
                        options: MapOptions(
                          initialCenter: issue.location,
                          initialZoom: 15.0,
                          // ADD this onTap callback to handle taps directly
                          onTap: (_, __) => setState(
                              () => _showMapOverlay = !_showMapOverlay),
                          // KEEP this line to disable pan/zoom
                          interactionOptions: const InteractionOptions(
                              flags: InteractiveFlag.none),
                        ),
                        children: [
                          TileLayer(
                              urlTemplate:
                                  'https://tile.openstreetmap.org/{z}/{x}/{y}.png'),
                          MarkerLayer(markers: [
                            Marker(
                                point: issue.location,
                                child: Icon(Icons.location_pin,
                                    color: _getPriorityColor(issue), size: 40))
                          ]),
                        ],
                      ),

                      // --- NEW: Overlay Buttons ---
                      if (_showMapOverlay)
                        Container(
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.5),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Center(
                            child: ElevatedButton.icon(
                              icon: const Icon(
                                  CupertinoIcons.arrow_turn_up_right),
                              label: const Text("Get Directions"),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.accentYellow,
                                foregroundColor: AppTheme.primaryDark,
                              ),
                              onPressed: () => _getDirections(issue),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

// ✅ ADD THIS NEW FUNCTION
  void _showImagePopup(BuildContext context, String imageUrl) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return Dialog(
          backgroundColor: Colors.transparent,
          insetPadding: const EdgeInsets.all(10),
          child: Stack(
            alignment: Alignment.center,
            children: <Widget>[
              // The interactive image viewer
              InteractiveViewer(
                panEnabled: true, // Set it to false to prevent panning.
                minScale: 0.5,
                maxScale: 4,
                child: Image.network(
                  imageUrl,
                  fit: BoxFit.contain,
                  loadingBuilder: (context, child, loadingProgress) {
                    if (loadingProgress == null) return child;
                    return const Center(child: CircularProgressIndicator());
                  },
                  errorBuilder: (context, error, stackTrace) {
                    return const Center(
                        child: Icon(Icons.error, color: Colors.red, size: 40));
                  },
                ),
              ),
              // A close button overlaid on the top-right corner
              Positioned(
                top: 0,
                right: 0,
                child: IconButton(
                  style: IconButton.styleFrom(
                    backgroundColor: Colors.black.withOpacity(0.5),
                  ),
                  icon: const Icon(Icons.close, color: Colors.white),
                  onPressed: () {
                    Navigator.of(context).pop();
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _getDirections(Issue issue) async {
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission != LocationPermission.whileInUse &&
            permission != LocationPermission.always) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Location permissions are denied.')),
          );
          return;
        }
      }

      // final Position position = await Geolocator.getCurrentPosition();
      final destination =
          "${issue.location.latitude},${issue.location.longitude}";

      // Construct the correct Google Maps URL
      final googleMapsUrl = Uri.parse(
          "https://www.google.com/maps/dir/?api=1&destination=$destination");

      if (await canLaunchUrl(googleMapsUrl)) {
        await launchUrl(googleMapsUrl, mode: LaunchMode.externalApplication);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open map for directions.')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to get location: ${e.toString()}')),
      );
    }
  }

  String toTitleCase(String text) {
    if (text.isEmpty) return '';

    // Split the string into words, capitalize each one, and join them back.
    return text.split(' ').map((word) {
      if (word.isEmpty) return '';
      return word[0].toUpperCase() + word.substring(1).toLowerCase();
    }).join(' ');
  }

  Widget _buildOrderStatusTab(BuildContext context, Issue issue) {
    return BlocBuilder<InventoryBloc, InventoryState>(
      builder: (context, state) {
        if (state is InventoryLoaded) {
          final issueSpecificRequests =
              state.requests.where((r) => r.issue.id == issue.id).toList();
          if (issueSpecificRequests.isEmpty) {
            return _buildEmptyState(
              icon: Icons.inventory_2_outlined,
              title: "No Inventory Requests",
              message:
                  "No inventory requests have been made for this issue yet.",
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: issueSpecificRequests.length,
            itemBuilder: (context, index) {
              final request = issueSpecificRequests[index];
              final statusInfo = _getStatusProperties(request.status);
              final itemsString = request.items
                  .map((item) => '${item.name} (${item.quantity})')
                  .join(', ');
              return Card(
                elevation: 1,
                margin: const EdgeInsets.only(bottom: 12),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
                child: ListTile(
                  contentPadding: const EdgeInsets.all(16),
                  title: Text(toTitleCase(itemsString),
                      style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text(
                      "Requested on: ${DateFormat('dd MMM, yyyy').format(request.requestedAt)}"),
                  trailing: Chip(
                    label: Text(statusInfo['text']),
                    backgroundColor: statusInfo['color'].withOpacity(0.1),
                    labelStyle: TextStyle(
                        color: statusInfo['color'],
                        fontWeight: FontWeight.bold),
                  ),
                ),
              );
            },
          );
        }
        return const Center(child: CircularProgressIndicator());
      },
    );
  }

  // --- Helper Widgets & Methods ---

  // ADDED: Definition for the missing method
  Widget _buildActionButtons(BuildContext context, Issue issue) {
    final bool canOrderInventory = issue.status == IssueStatus.in_progress;
    return SafeArea(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Theme.of(context).scaffoldBackgroundColor,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, -5),
            )
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 12),
            ElevatedButton.icon(
              icon: const Icon(CupertinoIcons.checkmark_seal),
              label: const Text("Update Status"),
              onPressed: () => _showUpdateStatusSheet(context, issue),
              style: ElevatedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 48)),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    icon: const Icon(CupertinoIcons.archivebox_fill),
                    label: const Text("Order Inventory"),
                    onPressed: canOrderInventory
                        ? () {
                            Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => OrderInventoryPage(
                                      issueId: issue.id,
                                      issueTitle: issue.title),
                                ));
                          }
                        : null,
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size(0, 48),
                      disabledBackgroundColor: Colors.grey.shade300,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton.icon(
                    icon: const Icon(CupertinoIcons.time_solid),
                    label: const Text("Extend Time"),
                    onPressed: () {
                      Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (_) =>
                                  ExtensionRequestPage(issueId: issue.id)));
                    },
                    style: OutlinedButton.styleFrom(
                        minimumSize: const Size(0, 48)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionCard(
      {required IconData icon,
      required String title,
      required List<Widget> children}) {
    return Card(
      elevation: 2,
      shadowColor: Colors.black.withOpacity(0.05),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, size: 20, color: AppTheme.accentBlue),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: GoogleFonts.inter(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.primaryDark),
                ),
              ],
            ),
            const Divider(height: 24),
            ...children,
          ],
        ),
      ),
    );
  }

  Widget _buildStatusChip(Issue issue) {
    return Chip(
      avatar: Icon(Icons.circle, size: 10, color: _getStatusColor(issue)),
      label: Text(
        issue.status.name.replaceAll('_', ' ').toUpperCase(),
        style: TextStyle(
            color: _getStatusColor(issue),
            fontWeight: FontWeight.w600,
            fontSize: 12),
      ),
      backgroundColor: _getStatusColor(issue).withOpacity(0.1),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
    );
  }

  Widget _buildPriorityChip(Issue issue) {
    return Chip(
      avatar: Icon(Icons.flag, size: 14, color: _getPriorityColor(issue)),
      label: Text(
        issue.priority.name.toUpperCase(),
        style: TextStyle(
            color: _getPriorityColor(issue),
            fontWeight: FontWeight.w600,
            fontSize: 12),
      ),
      backgroundColor: _getPriorityColor(issue).withOpacity(0.1),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
    );
  }

  Widget _buildExtensionStatusBanner(BuildContext context, Issue issue) {
    return BlocBuilder<ExtensionBloc, ExtensionState>(
      builder: (context, state) {
        if (state is ExtensionLoaded) {
          final request =
              state.requests.where((r) => r.issueId == issue.id).firstOrNull;
          if (request == null) return const SizedBox.shrink();

          Color bannerColor = Colors.blueGrey;
          String statusText = "Extension Request Pending";
          IconData icon = Icons.hourglass_top_rounded;

          if (request.status == ExtensionStatus.approved) {
            bannerColor = Colors.green;
            statusText = "Extension Request Approved! Swipe right to apply.";
            icon = Icons.check_circle_rounded;
          } else if (request.status == ExtensionStatus.rejected) {
            bannerColor = Colors.red;
            statusText = "Extension Request Rejected";
            icon = Icons.cancel_rounded;
          }

          if (request.status == ExtensionStatus.approved) {
            return Dismissible(
              key: ValueKey(request.id),
              direction: DismissDirection.startToEnd,
              background: Container(
                decoration: BoxDecoration(
                  color: Colors.green.shade700,
                  borderRadius: BorderRadius.circular(12),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 20),
                alignment: Alignment.centerLeft,
                child: const Icon(Icons.check, color: Colors.white),
              ),
              // onDismissed: (direction) {
              //   context.read<IssuesBloc>().add(UpdateSlaDate(
              //       issueId: issue.id, newSlaDate: request.newDueDate));
              //   context
              //       .read<ExtensionBloc>()
              //       .add(ClearApprovedRequest(request.id));
              // },
              child: _buildBannerUI(bannerColor, icon, statusText),
            );
          }
          return _buildBannerUI(bannerColor, icon, statusText);
        }
        return const SizedBox.shrink();
      },
    );
  }

  Widget _buildBannerUI(Color color, IconData icon, String text) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
              color: color.withOpacity(0.3),
              blurRadius: 8,
              offset: const Offset(0, 2))
        ],
      ),
      child: Row(
        children: [
          Icon(icon, color: Colors.white),
          const SizedBox(width: 12),
          Expanded(
              child: Text(text,
                  style: const TextStyle(
                      color: Colors.white, fontWeight: FontWeight.bold))),
        ],
      ),
    );
  }

  Widget _buildInfoRow(
      {required IconData icon,
      required String title,
      required String value,
      bool isOverdue = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        children: [
          Icon(icon, color: AppTheme.textSubtle, size: 20),
          const SizedBox(width: 16),
          Text(title,
              style: const TextStyle(fontSize: 15, color: AppTheme.textSubtle)),
          const Spacer(),
          Text(
            value,
            style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color: isOverdue ? Colors.red : AppTheme.primaryDark),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(
      {required IconData icon,
      required String title,
      required String message}) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 60, color: Colors.grey.shade300),
          const SizedBox(height: 16),
          Text(
            title,
            style: GoogleFonts.inter(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: AppTheme.textSubtle),
          ),
          const SizedBox(height: 8),
          Text(
            message,
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
          ),
        ],
      ),
    );
  }

  Map<String, dynamic> _getStatusProperties(RequestStatus status) {
    switch (status) {
      case RequestStatus.approved:
        return {'text': 'Approved', 'color': Colors.green};
      case RequestStatus.requested:
        return {'text': 'Pending', 'color': Colors.orange};
      case RequestStatus.rejected:
        return {'text': 'Rejected', 'color': Colors.red};
      case RequestStatus.billed:
        return {'text': 'Billed', 'color': Colors.grey};
    }
  }

  void _showUpdateStatusSheet(BuildContext context, Issue issue) {
    final availableStatuses = [IssueStatus.in_progress, IssueStatus.resolved];

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      // Remove the rounded corners
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // --- Drag Handle ---
                Container(
                  width: 40,
                  height: 5,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                const SizedBox(height: 24),
                // --- Header ---
                Text(
                  "Update Issue Status",
                  style: GoogleFonts.inter(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.primaryDark,
                  ),
                ),
                const SizedBox(height: 16),
                const Divider(),
                // --- Status Options ---
                ...availableStatuses.map((status) {
                  // Define appearance for each status
                  final isResolved = status == IssueStatus.resolved;
                  final icon = isResolved
                      ? CupertinoIcons.check_mark_circled
                      : CupertinoIcons.time;
                  final color = isResolved ? Colors.green : AppTheme.accentBlue;

                  return ListTile(
                    contentPadding: const EdgeInsets.symmetric(vertical: 8),
                    leading: Icon(icon, color: color),
                    title: Text(
                      status.name.replaceAll('_', ' ').toUpperCase(),
                      style: TextStyle(
                        fontWeight: FontWeight.w500,
                        color: color,
                      ),
                    ),
                    onTap: () {
                      // --- MODIFICATION ---
                      // If status is resolved, trigger the photo flow. Otherwise, update immediately.
                      if (isResolved) {
                        _handleResolveAction(ctx, issue);
                      } else {
                        context.read<IssuesBloc>().add(
                              UpdateIssueStatus(
                                  issueId: issue.id, newStatus: status),
                            );
                        Navigator.pop(ctx);
                      }
                    },
                  );
                }).toList(),
              ],
            ),
          ),
        );
      },
    );
  }

  Future<void> _handleResolveAction(
      BuildContext bottomSheetContext, Issue issue) async {
    Navigator.pop(bottomSheetContext); // Close the status sheet

    final XFile? image = await _takePhotoForProof();

    // CRITICAL: Only proceed if the user actually took a picture
    if (image == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Action cancelled: No photo taken.")),
      );
      return; // Exit the function
    }

    // Show loading dialog
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return const Dialog(
          child: Padding(
            padding: EdgeInsets.all(20.0),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                CircularProgressIndicator(),
                SizedBox(width: 20),
                Text("Uploading Proof..."),
              ],
            ),
          ),
        );
      },
    );

    try {
      final url = Uri.parse(
          'http://10.223.140.88:5000/api/officer/issues/${issue.id}/proof');
      var request = http.MultipartRequest('POST', url);

      const storage = FlutterSecureStorage();
      final token = await storage.read(key: 'userId');
      request.headers['x-user-id'] = '$token';

      final mimeType = image.mimeType ?? 'image/jpeg';
      request.files.add(await http.MultipartFile.fromPath(
        'proof',
        image.path,
        contentType: MediaType.parse(mimeType),
      ));

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200) {
        // SUCCESS: Update the status ONLY after successful upload
        context.read<IssuesBloc>().add(UpdateIssueStatus(
            issueId: issue.id, newStatus: IssueStatus.resolved));

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text("Proof uploaded and status updated to Resolved!"),
              backgroundColor: Colors.green),
        );
      } else {
        // FAIL: Show an error from the server response
        final responseBody = json.decode(response.body);
        throw Exception(responseBody['error'] ?? 'Failed to upload proof.');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text("Error: ${e.toString()}"),
            backgroundColor: Colors.red),
      );
    } finally {
      // Always close the loading dialog
      Navigator.of(context).pop();
    }
  }

  // --- MODIFICATION --- New method to ONLY take a photo (no gallery)
  Future<XFile?> _takePhotoForProof() async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.camera);
    return image;
  }

  Color _getPriorityColor(Issue issue) {
    switch (issue.priority) {
      case IssuePriority.critical:
        return Colors.red;
      case IssuePriority.high:
        return Colors.orange;
      case IssuePriority.medium:
        return AppTheme.accentYellow;
      default:
        return AppTheme.accentBlue;
    }
  }

  Color _getStatusColor(Issue issue) {
    switch (issue.status) {
      case IssueStatus.resolved:
      case IssueStatus.closed:
        return Colors.green;
      case IssueStatus.in_progress:
        return AppTheme.accentBlue;
      default:
        return AppTheme.textSubtle;
    }
  }

  bool _isOverdue(Issue issue) {
    // If there's no due date, it can't be overdue
    if (issue.slaDueDate == null) {
      return false;
    }
    // Compare date parts only, ignoring time
    final dueDate = issue.slaDueDate!;
    final today = DateTime.now();
    final dueDateOnly = DateTime(dueDate.year, dueDate.month, dueDate.day);
    final todayOnly = DateTime(today.year, today.month, today.day);

    return dueDateOnly.isBefore(todayOnly);
  }
}
