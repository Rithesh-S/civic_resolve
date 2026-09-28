import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
// import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';
import 'package:municipal_officer_app/features/issues/models/issue_model.dart';
import 'package:municipal_officer_app/features/issues/ui/issue_details_page.dart';

// Convert to a StatefulWidget to manage the MapController
class IssuesMapView extends StatefulWidget {
  final List<Issue> issues;
  const IssuesMapView({super.key, required this.issues});

  @override
  State<IssuesMapView> createState() => IssuesMapViewState();
}

class IssuesMapViewState extends State<IssuesMapView> {
  final MapController _mapController = MapController();

  // --- NEW: Method to move to current location ---
  // Future<void> moveToCurrentLocation() async {
  //   bool serviceEnabled;
  //   LocationPermission permission;

  //   serviceEnabled = await Geolocator.isLocationServiceEnabled();
  //   if (!serviceEnabled) {
  //     ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Location services are disabled.')));
  //     return;
  //   }
  //   permission = await Geolocator.checkPermission();
  //   if (permission == LocationPermission.denied) {
  //     permission = await Geolocator.requestPermission();
  //     if (permission == LocationPermission.denied) {
  //       ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Location permissions are denied')));
  //       return;
  //     }
  //   }
  //   if (permission == LocationPermission.deniedForever) {
  //     ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Location permissions are permanently denied, we cannot request permissions.')));
  //     return;
  //   }
    
  //   final position = await Geolocator.getCurrentPosition();
  //   _mapController.move(LatLng(position.latitude, position.longitude), 15.0);
  // }

  // --- NEW: Helper for custom icons ---
  IconData _getIconForCategory(String category) {
    switch (category) {
      case "Streetlight": return CupertinoIcons.lightbulb_fill;
      case "Water Leakage": return CupertinoIcons.drop_fill;
      case "Roads": return CupertinoIcons.wrench_fill;
      default: return CupertinoIcons.tag_fill;
    }
  }

  Color _getColorForPriority(IssuePriority priority) {
    switch (priority) {
      case IssuePriority.critical: return Colors.red;
      case IssuePriority.high: return Colors.orange;
      case IssuePriority.medium: return Colors.amber;
      default: return Colors.blue;
    }
  }

  @override
  Widget build(BuildContext context) {
    return FlutterMap(
      mapController: _mapController,
      options: MapOptions(
        initialCenter: widget.issues.isNotEmpty ? widget.issues.first.location : const LatLng(9.9252, 78.1198), // Madurai, India
        // initialCenter: LatLng(9.9252, 78.1198), // Madurai, India
        initialZoom: 12.0,
      ),
      children: [
        TileLayer(
          urlTemplate: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        ),
        MarkerLayer(
          markers: widget.issues.map((issue) {
            final color = _getColorForPriority(issue.priority);
            final icon = _getIconForCategory(issue.category);
            return Marker(
              width: 40.0,
              height: 40.0,
              point: issue.location,
              child: GestureDetector(
                onTap: () => _showIssueDetailsSheet(context, issue),
                child: Container(
                  decoration: BoxDecoration(
                    color: color,
                    shape: BoxShape.circle,
                    boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.3), blurRadius: 5, offset: const Offset(0, 2))],
                  ),
                  child: Icon(icon, color: Colors.white, size: 20),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  void _showIssueDetailsSheet(BuildContext context, Issue issue) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(issue.title, style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Chip(label: Text(issue.category), backgroundColor: Colors.grey.shade200),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(ctx);
                Navigator.push(context, MaterialPageRoute(builder: (_) => IssueDetailsPage(issueId: issue.id)));
              },
              style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 48)),
              child: const Text('View Full Details'),
            ),
          ],
        ),
      ),
    );
  }
}