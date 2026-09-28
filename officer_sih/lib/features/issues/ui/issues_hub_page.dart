import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:municipal_officer_app/core/theme.dart';
import 'package:municipal_officer_app/features/inventory/bloc/inventory_bloc.dart';
import 'package:municipal_officer_app/features/inventory/bloc/inventory_event.dart';
import 'package:municipal_officer_app/features/issues/bloc/issues_bloc.dart';
import 'package:municipal_officer_app/features/issues/bloc/issues_event.dart';
import 'package:municipal_officer_app/features/issues/bloc/issues_state.dart';
import 'package:municipal_officer_app/features/issues/ui/widgets/issues_list_view.dart';
import 'package:municipal_officer_app/features/issues/ui/widgets/issues_map_view.dart';

class IssuesHubPage extends StatefulWidget {
  const IssuesHubPage({super.key});

  @override
  State<IssuesHubPage> createState() => _IssuesHubPageState();
}

class _IssuesHubPageState extends State<IssuesHubPage> {
  bool _isMapView = true;
  // A key to access the state of the map view from this parent widget
  final GlobalKey<IssuesMapViewState> _mapViewKey = GlobalKey();

  @override
  void initState() {
    super.initState();
    if (context.read<IssuesBloc>().state is! IssuesLoaded) {
      context.read<IssuesBloc>().add(FetchIssues());
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text("Issues Hub"),
        actions: [
          IconButton(
            icon: const Icon(CupertinoIcons.refresh),
            tooltip: 'Refresh Issues',
            onPressed: () {
              context.read<IssuesBloc>().add(FetchIssues());
              context.read<InventoryBloc>().add(FetchInventoryData());
            },
          ),
        ],
      ),
      body: BlocBuilder<IssuesBloc, IssuesState>(
        builder: (context, state) {
          return Column(
            children: [
              // --- View Toggle ---
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: CupertinoSlidingSegmentedControl<bool>(
                  groupValue: _isMapView,
                  backgroundColor: AppTheme.accentBlue.withOpacity(0.1),
                  thumbColor: AppTheme.accentBlue,
                  children: <bool, Widget>{
                    true: _buildSegment("Map", CupertinoIcons.map_fill),
                    false: _buildSegment("List", CupertinoIcons.list_bullet),
                  },
                  onValueChanged: (bool? value) {
                    if (value != null) {
                      setState(() { _isMapView = value; });
                    }
                  },
                ),
              ),
              // --- Main Content ---
              Expanded(
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 300),
                  child: _buildBody(state),
                ),
              ),
            ],
          );
        },
      ),
      // floatingActionButton: _isMapView ? FloatingActionButton(
      //   onPressed: () => _mapViewKey.currentState?.moveToCurrentLocation(),
      //   child: const Icon(CupertinoIcons.location_fill),
      // ) : null,
    );
  }

  Widget _buildSegment(String text, IconData icon) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 18),
          const SizedBox(width: 8),
          Text(text, style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  Widget _buildBody(IssuesState state) {
    if (state is IssuesLoading || state is IssuesInitial) {
      return const Center(key: ValueKey('loading'), child: CircularProgressIndicator());
    }
    if (state is IssuesLoaded) {
      return _isMapView
          ? IssuesMapView(key: _mapViewKey, issues: state.issues)
          : IssuesListView(issues: state.issues);
    }
    return Center(key: const ValueKey('error'), child: Text("Failed to load issues: ${(state as IssuesError).message}"));
  }
}