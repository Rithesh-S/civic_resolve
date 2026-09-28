import 'package:flutter/material.dart';
import 'package:flutter_application_2/models/issue_model.dart';
import 'package:flutter_application_2/services/api_service.dart';
import 'package:flutter_application_2/utils/colors.dart';
import 'package:flutter_application_2/screens/citizen/details/full_issue_details_screen.dart';
import 'package:flutter_application_2/screens/citizen/raise_issue/raise_issue_screen.dart';

class MyIssuesScreen extends StatefulWidget {
  const MyIssuesScreen({super.key});

  @override
  State<MyIssuesScreen> createState() => _MyIssuesScreenState();
}

class _MyIssuesScreenState extends State<MyIssuesScreen> with SingleTickerProviderStateMixin {
  final ApiService _apiService = ApiService();
  List<Issue> _myIssues = [];
  List<Issue> _upvotedIssues = [];
  String _filterStatus = 'all';
  final List<String> _statusFilters = ['all', 'submitted', 'inProgress', 'resolved'];
  bool _isLoading = true;
  bool _hasError = false;
  int _currentPage = 1;
  int _totalPages = 1;
  int _totalItems = 0;
  int _resolvedIssues = 0;
  
  // Tab controller
  late TabController _tabController;
  int _currentTabIndex = 0;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(_handleTabSelection);
    _loadIssues();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _handleTabSelection() {
    if (_tabController.indexIsChanging) {
      setState(() {
        _currentTabIndex = _tabController.index;
      });
      
      // Load upvoted issues if we're switching to that tab and it's empty
      if (_tabController.index == 1 && _upvotedIssues.isEmpty) {
        _loadUpvotedIssues();
      }
    }
  }

  Future<void> _loadIssues({int page = 1, bool refresh = false}) async {
    try {
      setState(() {
        _isLoading = true;
        _hasError = false;
        if (refresh) {
          _myIssues = [];
        }
      });

      // Convert frontend filter status to backend query parameter
      String statusParam = _filterStatus;
      if (_filterStatus == 'submitted') {
        statusParam = 'submitted';
      } else if (_filterStatus == 'inProgress') {
        statusParam = 'in_progress';
      } else if (_filterStatus == 'resolved') {
        statusParam = 'resolved';
      }

      final response = await _apiService.getMyIssues(
        page: page,
        limit: 10,
        status: statusParam,
      );

      setState(() {
        if (refresh) {
          _myIssues = response['issues'];
        } else {
          _myIssues.addAll(response['issues']);
        }
        _currentPage = page;
        _totalPages = response['pagination']['pages'];
        _totalItems = response['pagination']['total'];
        
        // Calculate resolved issues count
        _resolvedIssues = _myIssues.where((issue) => 
          issue.status == IssueStatus.resolved || 
          issue.status == IssueStatus.closed
        ).length;
        
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _hasError = true;
        _isLoading = false;
      });
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to load issues: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _loadUpvotedIssues({int page = 1, bool refresh = false}) async {
    try {
      setState(() {
        _isLoading = true;
        _hasError = false;
        if (refresh) {
          _upvotedIssues = [];
        }
      });

      // Convert frontend filter status to backend query parameter
      String statusParam = _filterStatus;
      if (_filterStatus == 'submitted') {
        statusParam = 'submitted';
      } else if (_filterStatus == 'inProgress') {
        statusParam = 'in_progress';
      } else if (_filterStatus == 'resolved') {
        statusParam = 'resolved';
      }

      final response = await _apiService.getUpvotedIssues(
        page: page,
        limit: 10,
        status: statusParam,
      );

      setState(() {
        if (refresh) {
          _upvotedIssues = response['issues'];
        } else {
          _upvotedIssues.addAll(response['issues']);
        }
        _currentPage = page;
        _totalPages = response['pagination']['pages'];
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _hasError = true;
        _isLoading = false;
      });
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to load upvoted issues: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _refreshIssues() async {
    if (_currentTabIndex == 0) {
      await _loadIssues(page: 1, refresh: true);
    } else {
      await _loadUpvotedIssues(page: 1, refresh: true);
    }
    
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Issues refreshed'),
        duration: Duration(seconds: 1),
      ),
    );
  }

  void _handleFilterChange(String filter) {
    setState(() {
      _filterStatus = filter;
    });
    
    if (_currentTabIndex == 0) {
      _loadIssues(page: 1, refresh: true);
    } else {
      _loadUpvotedIssues(page: 1, refresh: true);
    }
  }

  String _getStatusFilterText(String filter) {
    switch (filter) {
      case 'all': return 'All Issues';
      case 'submitted': return 'Submitted';
      case 'inProgress': return 'In Progress';
      case 'resolved': return 'Resolved';
      default: return 'All';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        // title: const Text('My Reported Issues'),
        centerTitle: true,
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'My Issues'),
            Tab(text: 'Upvoted Issues'),
          ],
          indicatorColor: Colors.white,
          labelStyle: TextStyle(fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _refreshIssues,
            tooltip: 'Refresh issues',
          ),
        ],
      ),
      body: Column(
        children: [
          // User stats header - Only show for My Issues tab
          if (_currentTabIndex == 0)
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.05),
              border: Border(bottom: BorderSide(color: Colors.grey.shade200)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildStatItem(
                  value: _totalItems.toString(),
                  label: 'Reported',
                  icon: Icons.report_problem,
                ),
                _buildStatItem(
                  value: _myIssues.where((i) => i.upvoteCount > 0).length.toString(),
                  label: 'Upvoted',
                  icon: Icons.thumb_up,
                ),
                _buildStatItem(
                  value: '$_resolvedIssues/${_myIssues.length}',
                  label: 'Resolved',
                  icon: Icons.check_circle,
                ),
              ],
            ),
          ),
          
          // Filter chips
          Container(
            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
            color: Colors.white,
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: _statusFilters.map((filter) {
                  final isSelected = _filterStatus == filter;
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: FilterChip(
                      label: Text(_getStatusFilterText(filter)),
                      selected: isSelected,
                      onSelected: (selected) {
                        _handleFilterChange(filter);
                      },
                      backgroundColor: Colors.white,
                      selectedColor: AppColors.primary.withOpacity(0.2),
                      labelStyle: TextStyle(
                        color: isSelected ? AppColors.primary : Colors.grey[600],
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      ),
                      shape: StadiumBorder(
                        side: BorderSide(
                          color: isSelected ? AppColors.primary : Colors.grey.shade300,
                          width: 1,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),
          
          // Tab content
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                // My Issues Tab
                _buildIssuesList(_myIssues),
                
                // Upvoted Issues Tab
                _buildIssuesList(_upvotedIssues),
              ],
            ),
          ),
        ],
      ),
      floatingActionButton: _currentTabIndex == 0 ? FloatingActionButton(
        onPressed: () {
          Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const RaiseIssueScreen()),
          );
        },
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        child: const Icon(Icons.add),
      ) : null,
    );
  }

  Widget _buildIssuesList(List<Issue> issues) {
    // Loading and error states
    if (_isLoading && issues.isEmpty) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    } else if (_hasError && issues.isEmpty) {
      return Center(
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
              onPressed: _refreshIssues,
              child: const Text('Try Again'),
            ),
          ],
        ),
      );
    } else if (issues.isEmpty) {
      return _buildEmptyState();
    } else {
      return RefreshIndicator(
        onRefresh: _refreshIssues,
        child: ListView.builder(
          itemCount: issues.length + (_hasMorePages() ? 1 : 0),
          itemBuilder: (context, index) {
            if (index == issues.length) {
              return _buildLoadMoreButton();
            }
            return IssueListCard(issue: issues[index]);
          },
        ),
      );
    }
  }

  bool _hasMorePages() {
    return _currentPage < _totalPages && !_isLoading;
  }

  Widget _buildLoadMoreButton() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Center(
        child: _isLoading
            ? const CircularProgressIndicator()
            : ElevatedButton(
                onPressed: () {
                  if (_currentTabIndex == 0) {
                    _loadIssues(page: _currentPage + 1);
                  } else {
                    _loadUpvotedIssues(page: _currentPage + 1);
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                ),
                child: const Text('Load More Issues'),
              ),
      ),
    );
  }

  Widget _buildStatItem({required String value, required String label, required IconData icon}) {
    return Column(
      children: [
        Icon(icon, size: 20, color: AppColors.primary),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }

  Widget _buildEmptyState() {
    String emptyMessage;
    String emptyDescription;
    
    if (_currentTabIndex == 0) {
      emptyMessage = _filterStatus == 'all' 
          ? 'No issues reported yet'
          : 'No ${_getStatusFilterText(_filterStatus).toLowerCase()} issues';
      emptyDescription = _filterStatus == 'all'
          ? 'Start by reporting an issue in your community'
          : 'All your ${_getStatusFilterText(_filterStatus).toLowerCase()} issues will appear here';
    } else {
      emptyMessage = _filterStatus == 'all' 
          ? 'No upvoted issues yet'
          : 'No ${_getStatusFilterText(_filterStatus).toLowerCase()} upvoted issues';
      emptyDescription = _filterStatus == 'all'
          ? 'Upvote issues to see them here'
          : 'All your ${_getStatusFilterText(_filterStatus).toLowerCase()} upvoted issues will appear here';
    }
    
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.inbox,
            size: 64,
            color: Colors.grey.shade300,
          ),
          const SizedBox(height: 16),
          Text(
            emptyMessage,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 40),
            child: Text(
              emptyDescription,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: AppColors.textSecondary,
              ),
            ),
          ),
          const SizedBox(height: 20),
          if (_filterStatus != 'all')
            ElevatedButton(
              onPressed: () {
                setState(() {
                  _filterStatus = 'all';
                });
                if (_currentTabIndex == 0) {
                  _loadIssues(page: 1, refresh: true);
                } else {
                  _loadUpvotedIssues(page: 1, refresh: true);
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
              ),
              child: const Text('View All Issues'),
            ),
        ],
      ),
    );
  }
}

class IssueListCard extends StatelessWidget {
  final Issue issue;
  const IssueListCard({super.key, required this.issue});
  
  Color _getStatusColor(IssueStatus status) {
    switch (status) {
      case IssueStatus.resolved:
      case IssueStatus.closed:
        return Colors.green;
      case IssueStatus.inProgress:
        return AppColors.secondary;
      case IssueStatus.acknowledged:
        return Colors.blue;
      case IssueStatus.submitted:
      default:
        return Colors.orange;
    }
  }

  String _getStatusText(IssueStatus status) {
    switch (status) {
      case IssueStatus.submitted:
        return 'SUBMITTED';
      case IssueStatus.acknowledged:
        return 'ACKNOWLEDGED';
      case IssueStatus.inProgress:
        return 'IN PROGRESS';
      case IssueStatus.resolved:
        return 'RESOLVED';
      case IssueStatus.closed:
        return 'CLOSED';
      default:
        return 'SUBMITTED';
    }
  }

  IconData _getCategoryIcon(IssueCategory category) {
    switch (category) {
      case IssueCategory.roads:
        return Icons.edit_road_outlined;
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

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);
    
    if (difference.inDays > 0) {
      return '${difference.inDays} day${difference.inDays > 1 ? 's' : ''} ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours} hour${difference.inHours > 1 ? 's' : ''} ago';
    } else {
      return '${difference.inMinutes} minute${difference.inMinutes > 1 ? 's' : ''} ago';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      elevation: 2,
      child: InkWell(
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => FullIssueDetailsScreen(issue: issue)),
          );
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Category icon
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: _getStatusColor(issue.status).withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  _getCategoryIcon(issue.category),
                  size: 20,
                  color: _getStatusColor(issue.status),
                ),
              ),
              const SizedBox(width: 12),
              
              // Issue details
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      issue.title,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      issue.locationAddress,
                      style: TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 14,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Chip(
                          label: Text(
                            _getStatusText(issue.status),
                            style: TextStyle(
                              color: _getStatusColor(issue.status),
                              fontWeight: FontWeight.bold,
                              fontSize: 10,
                            ),
                          ),
                          backgroundColor: _getStatusColor(issue.status).withOpacity(0.1),
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        ),
                        const SizedBox(width: 8),
                        Icon(Icons.thumb_up, size: 14, color: AppColors.textSecondary),
                        const SizedBox(width: 4),
                        Text(
                          '${issue.upvoteCount}',
                          style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                        ),
                        const Spacer(),
                        Text(
                          _formatDate(issue.createdAt),
                          style: TextStyle(
                            fontSize: 12,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}