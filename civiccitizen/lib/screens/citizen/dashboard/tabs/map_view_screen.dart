import 'package:flutter/material.dart';
import 'package:flutter_application_2/models/issue_model.dart';
import 'package:flutter_application_2/screens/citizen/details/full_issue_details_screen.dart';
import 'package:flutter_application_2/screens/citizen/raise_issue/raise_issue_screen.dart';
import 'package:flutter_application_2/utils/colors.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:flutter_application_2/services/api_service.dart';

// Add feedback screen
class FeedbackScreen extends StatefulWidget {
  final Issue issue;

  const FeedbackScreen({super.key, required this.issue}); // Fixed constructor

  @override
  State<FeedbackScreen> createState() => _FeedbackScreenState();
}

class _FeedbackScreenState extends State<FeedbackScreen> {
  final ApiService _apiService = ApiService();
  final _formKey = GlobalKey<FormState>();
  int _rating = 0;
  String _comment = '';
  bool _isSubmitting = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        // title: const Text('Provide Feedback'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'How would you rate the resolution of this issue?',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 16),
              // Star rating
              Center(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(5, (index) {
                    return IconButton(
                      icon: Icon(
                        index < _rating ? Icons.star : Icons.star_border,
                        color: Colors.amber,
                        size: 40,
                      ),
                      onPressed: () {
                        setState(() {
                          _rating = index + 1;
                        });
                      },
                    );
                  }),
                ),
              ),
              const SizedBox(height: 24),
              TextFormField(
                decoration: const InputDecoration(
                  labelText: 'Comments (optional)',
                  border: OutlineInputBorder(),
                  hintText: 'Share your experience with this issue resolution...',
                ),
                maxLines: 4,
                maxLength: 500,
                onChanged: (value) {
                  setState(() {
                    _comment = value;
                  });
                },
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  onPressed: _isSubmitting ? null : _submitFeedback,
                  child: _isSubmitting
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text('Submit Feedback'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _submitFeedback() async {
    if (_rating == 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a rating')),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      await _apiService.provideFeedback(
        issueId: widget.issue.id,
        rating: _rating,
        comment: _comment,
      );

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Feedback submitted successfully')),
      );

      Navigator.of(context).pop(true);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to submit feedback: $e')),
      );
    } finally {
      setState(() {
        _isSubmitting = false;
      });
    }
  }
}

// Updated MapViewScreen with upvote and feedback integration
class MapViewScreen extends StatefulWidget {
  final String? highlightIssueId;

  const MapViewScreen({super.key, this.highlightIssueId});

  @override
  State<MapViewScreen> createState() => _MapViewScreenState();
}

class _MapViewScreenState extends State<MapViewScreen> {
  final ApiService _apiService = ApiService();
  List<Issue> _issues = [];
  LatLng? _currentLocation;
  bool _locationLoading = true;
  bool _issuesLoading = true;
  bool _hasError = false;
  final MapController _mapController = MapController();
  bool _showIssueClusters = true;
  String? _highlightedIssueId;

  @override
  void initState() {
    super.initState();
    _highlightedIssueId = widget.highlightIssueId;
    _getCurrentLocation();
    _loadAllIssues();
  }

  Future<void> _getCurrentLocation() async {
    try {
      final status = await Permission.location.request();
      if (status.isGranted) {
        final position = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.best,
        );

        setState(() {
          _currentLocation = LatLng(position.latitude, position.longitude);
          _locationLoading = false;
        });

        _mapController.move(_currentLocation!, 15.0);
      } else {
        setState(() {
          _locationLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Location permission is required to show your current position'),
          ),
        );
      }
    } catch (e) {
      setState(() {
        _locationLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Unable to get your current location')),
      );
    }
  }
  @override
  void didUpdateWidget(covariant MapViewScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.highlightIssueId != oldWidget.highlightIssueId) {
      _highlightedIssueId = widget.highlightIssueId;
      _showHighlightedIssue();
    }
  }

  void _showHighlightedIssue() {
    if (_highlightedIssueId != null && _issues.isNotEmpty) {
      // Find the issue to highlight
      final highlightedIssue = _issues.firstWhere(
        (issue) => issue.id == _highlightedIssueId,
        orElse: () => _issues.first, // Fallback if not found
      );
      
      // Center map on the highlighted issue
      _mapController.move(
        LatLng(highlightedIssue.coordinates[1], highlightedIssue.coordinates[0]),
        15.0,
      );
      
      // Show the issue details modal after a short delay
      Future.delayed(const Duration(milliseconds: 500), () {
        if (mounted) {
          _showIssueDetailsModal(highlightedIssue);
        }
      });
    }
  }

  Future<void> _loadAllIssues() async {
    try {
      setState(() {
        _issuesLoading = true;
        _hasError = false;
      });

      final response = await _apiService.getAllIssues(
        page: 1,
        limit: 100, // Load more issues for the map view
      );

      setState(() {
        _issues = response['issues'];
        _issuesLoading = false;
      });

      // If we have issues and no current location, center map on first issue
      if (_issues.isNotEmpty && _currentLocation == null) {
        final firstIssue = _issues.first;
        _mapController.move(
          LatLng(firstIssue.coordinates[1], firstIssue.coordinates[0]),
          13.0,
        );
      }
      
      // Show highlighted issue if we have one
      if (_highlightedIssueId != null) {
        _showHighlightedIssue();
      }
    } catch (e) {
      setState(() {
        _hasError = true;
        _issuesLoading = false;
      });
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to load issues: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _refreshData() async {
    await Future.wait([
      _getCurrentLocation(),
      _loadAllIssues(),
    ]);
    
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Map data refreshed'),
        duration: Duration(seconds: 1),
      ),
    );
  }

  Color _getPinColor(IssueStatus status) {
    switch (status) {
      case IssueStatus.resolved:
      case IssueStatus.closed:
        return Colors.green;
      case IssueStatus.inProgress:
        return AppColors.secondary;
      case IssueStatus.acknowledged:
        return Colors.blue;
      default:
        return Colors.red;
    }
  }

  IconData _getPinIcon(IssueCategory category) {
    switch (category) {
      case IssueCategory.roads:
        return Icons.edit_road_rounded;
      case IssueCategory.sanitation:
        return Icons.delete;
      case IssueCategory.streetlight:
        return Icons.lightbulb;
      case IssueCategory.parks:
        return Icons.park;
      case IssueCategory.waterleakage:
        return Icons.water_drop;
      default:
        return Icons.warning;
    }
  }

  // Add upvote functionality
  Future<void> _upvoteIssue(String issueId) async {
    try {
      await _apiService.upvoteIssue(issueId);
      
      // Update local issue data - create a new list with updated issue
      setState(() {
        _issues = _issues.map((issue) {
          if (issue.id == issueId) {
            // Create a new Issue object with updated upvote count
            return Issue(
              id: issue.id,
              title: issue.title,
              description: issue.description,
              category: issue.category,
              status: issue.status,
              priority: issue.priority,
              locationAddress: issue.locationAddress,
              coordinates: issue.coordinates,
              assignedOfficerId: issue.assignedOfficerId,
              assignedOfficerName: issue.assignedOfficerName,
              reporterId: issue.reporterId,
              channel: issue.channel,
              createdAt: issue.createdAt,
              slaDueDate: issue.slaDueDate,
              upvoteCount: issue.upvoteCount + 1, // Increment upvote count
              media: issue.media,
              statusHistory: issue.statusHistory,
            );
          }
          return issue;
        }).toList();
      });
      
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Issue upvoted successfully')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to upvote issue: $e')),
      );
    }
  }

  void _showIssueDetailsModal(Issue issue) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return DraggableScrollableSheet(
          expand: false,
          initialChildSize: 0.4,
          minChildSize: 0.3,
          maxChildSize: 0.8,
          builder: (context, scrollController) {
            return SingleChildScrollView(
              controller: scrollController,
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Container(
                        width: 40,
                        height: 5,
                        decoration: BoxDecoration(
                          color: Colors.grey[300],
                          borderRadius: BorderRadius.circular(3),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Icon(
                          _getPinIcon(issue.category),
                          color: _getPinColor(issue.status),
                          size: 24,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            issue.title,
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Chip(
                      label: Text(issue.status.name.toUpperCase()),
                      backgroundColor: _getPinColor(issue.status).withOpacity(0.1),
                      labelStyle: TextStyle(
                        color: _getPinColor(issue.status),
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      issue.description,
                      style: const TextStyle(
                        fontSize: 16,
                        color: Colors.black87,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        const Icon(
                          Icons.location_on_outlined,
                          color: AppColors.textSecondary,
                          size: 20,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            issue.locationAddress,
                            style: const TextStyle(
                              fontSize: 14,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        const Icon(
                          Icons.thumb_up_alt_outlined,
                          color: AppColors.textSecondary,
                          size: 20,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '${issue.upvoteCount} upvotes',
                          style: const TextStyle(fontSize: 16),
                        ),
                        const Spacer(),
                        ElevatedButton.icon(
                          icon: const Icon(Icons.thumb_up, size: 18),
                          label: const Text('Upvote'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary.withOpacity(0.1),
                            foregroundColor: AppColors.primary,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 8,
                            ),
                          ),
                          onPressed: () => _upvoteIssue(issue.id),
                        ),
                      ],
                    ),
                    // Add feedback button for resolved/closed issues
                    if (issue.status == IssueStatus.resolved || issue.status == IssueStatus.closed)
                      Padding(
                        padding: const EdgeInsets.only(top: 16.0),
                        child: SizedBox(
                          width: double.infinity,
                          child: OutlinedButton.icon(
                            icon: const Icon(Icons.feedback_outlined),
                            label: const Text('Provide Feedback'),
                            onPressed: () {
                              Navigator.of(context).pop();
                              Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder: (_) => FeedbackScreen(issue: issue),
                                ),
                              );
                            },
                          ),
                        ),
                      ),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: const Text('VIEW FULL DETAILS'),
                        onPressed: () {
                          Navigator.of(context).pop();
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => FullIssueDetailsScreen(issue: issue), // Fixed parameter
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  void _centerMapOnCurrentLocation() {
    if (_currentLocation != null) {
      _mapController.move(_currentLocation!, 15.0);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        // title: const Text('Civic Issues Map'),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _refreshData,
            tooltip: 'Refresh data',
          ),
          IconButton(
            icon: const Icon(Icons.my_location),
            onPressed: _centerMapOnCurrentLocation,
            tooltip: 'Center on my location',
          ),
          IconButton(
            icon: Icon(_showIssueClusters ? Icons.layers : Icons.layers_clear),
            onPressed: () {
              setState(() {
                _showIssueClusters = !_showIssueClusters;
              });
            },
            tooltip: 'Toggle issue clusters',
          ),
        ],
      ),
      body: Stack(
        children: [
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: _currentLocation ?? const LatLng(11.0168, 76.9558),
              initialZoom: _currentLocation != null ? 15.0 : 13.0,
              onMapReady: () {
                if (_currentLocation != null) {
                  _mapController.move(_currentLocation!, 15.0);
                } else if (_issues.isNotEmpty) {
                  final firstIssue = _issues.first;
                  _mapController.move(
                    LatLng(firstIssue.coordinates[1], firstIssue.coordinates[0]),
                    13.0,
                  );
                }
              },
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                subdomains: const ['a', 'b', 'c'],
                userAgentPackageName: 'com.civicresolve.app',
              ),
              
              // Current location marker
              if (_currentLocation != null)
                MarkerLayer(
                  markers: [
                    Marker(
                      width: 30.0,
                      height: 30.0,
                      point: _currentLocation!,
                      child: Container(
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.2),
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: AppColors.primary,
                            width: 2,
                          ),
                        ),
                        child: const Icon(
                          Icons.person_pin_circle,
                          color: AppColors.primary,
                          size: 30,
                        ),
                      ),
                    ),
                  ],
                ),
              
              // Issue markers
              if (_showIssueClusters && _issues.isNotEmpty)
                MarkerLayer(
                  markers: _issues.map((issue) {
                    return Marker(
                      width: 40.0,
                      height: 40.0,
                      point: LatLng(issue.coordinates[1], issue.coordinates[0]),
                      child: GestureDetector(
                        onTap: () => _showIssueDetailsModal(issue),
                        child: Container(
                          decoration: BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.2),
                                blurRadius: 4,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Icon(
                            _getPinIcon(issue.category),
                            size: 24,
                            color: _getPinColor(issue.status),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
            ],
          ),

          // Loading indicators
          if (_locationLoading || _issuesLoading)
            const Center(child: CircularProgressIndicator()),

          // Error state
          if (_hasError && _issues.isEmpty)
            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 64, color: Colors.red),
                  const SizedBox(height: 16),
                  const Text(
                    'Failed to load issues',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  ElevatedButton(
                    onPressed: _refreshData,
                    child: const Text('Try Again'),
                  ),
                ],
              ),
            ),

          // Map controls
          Positioned(
            bottom: 100,
            right: 16,
            child: Column(
              children: [
                FloatingActionButton(
                  heroTag: 'zoom_in',
                  mini: true,
                  onPressed: () {
                    _mapController.move(
                      _mapController.camera.center,
                      _mapController.camera.zoom + 1,
                    );
                  },
                  child: const Icon(Icons.add),
                ),
                const SizedBox(height: 8),
                FloatingActionButton(
                  heroTag: 'zoom_out',
                  mini: true,
                  onPressed: () {
                    _mapController.move(
                      _mapController.camera.center,
                      _mapController.camera.zoom - 1,
                    );
                  },
                  child: const Icon(Icons.remove),
                ),
              ],
            ),
          ),

          // Issue summary panel
          if (_issues.isNotEmpty && _showIssueClusters)
            Positioned(
              top: 16,
              left: 16,
              right: 16,
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.info_outline,
                      color: AppColors.primary,
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        '${_issues.length} issues reported in your area',
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    if (_issuesLoading)
                      const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                  ],
                ),
              ),
            ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const RaiseIssueScreen()),
          );
        },
        label: const Text(
          'Report Issue',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
        ),
        icon: const Icon(Icons.add, color: Colors.white),
        backgroundColor: AppColors.primary,
        elevation: 4,
      ),
    );
  }
}