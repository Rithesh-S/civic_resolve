import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:municipal_officer_app/core/theme.dart';
import 'package:municipal_officer_app/features/inventory/bloc/inventory_bloc.dart';
import 'package:municipal_officer_app/features/inventory/bloc/inventory_event.dart';
import 'package:municipal_officer_app/features/inventory/bloc/inventory_state.dart';
import 'package:municipal_officer_app/features/inventory/models/inventory_item_model.dart';

class OrderInventoryPage extends StatefulWidget {
  final String issueId;
  final String issueTitle;
  const OrderInventoryPage(
      {super.key, required this.issueId, required this.issueTitle});

  @override
  State<OrderInventoryPage> createState() => _OrderInventoryPageState();
}

class _OrderInventoryPageState extends State<OrderInventoryPage> {
  final Map<InventoryItem, int> _cart = {};
  List<InventoryItem> _filteredItems = [];
  final _searchController = TextEditingController();
   bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    final currentState = context.read<InventoryBloc>().state;
    if (currentState is InventoryLoaded) {
      _filteredItems = currentState.items;
    }
    _searchController.addListener(_filterItems);
  }

  void _filterItems() {
    final currentState = context.read<InventoryBloc>().state;
    if (currentState is InventoryLoaded) {
      final query = _searchController.text.toLowerCase();
      setState(() {
        _filteredItems = currentState.items.where((item) {
          return item.name.toLowerCase().contains(query);
        }).toList();
      });
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _updateCart(InventoryItem item, int quantity) {
    setState(() {
      if (quantity > 0) {
        _cart[item] = quantity;
      } else {
        _cart.remove(item);
      }
    });
  }

  void _submitRequest() {
    if (_cart.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Your cart is empty.')),
      );
      return;
    }
    context.read<InventoryBloc>().add(SubmitInventoryRequest(
          issueId: widget.issueId,
          issueTitle: widget.issueTitle, // issueTitle is no longer needed by the bloc, but we'll keep it for now
          cart: _cart,
        ));
  }

  @override
  Widget build(BuildContext context) {
    // --- MODIFICATION --- Wrap the Scaffold with a BlocListener
    return BlocListener<InventoryBloc, InventoryState>(
      listener: (context, state) {
        if (state is InventorySubmitting) {
          setState(() => _isSubmitting = true);
        }
        if (state is InventorySubmitSuccess) {
          setState(() => _isSubmitting = false);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
                content: Text('Inventory request submitted successfully!'),
                backgroundColor: Colors.green),
          );
          Navigator.of(context).pop();
        }
        if (state is InventorySubmitFailure) {
          setState(() => _isSubmitting = false);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
                content: Text('Error: ${state.error}'),
                backgroundColor: Colors.red),
          );
        }
      },
      child: Scaffold(
        extendBodyBehindAppBar: true,
        backgroundColor: AppTheme.background,
        appBar: AppBar(
          title: Text("Order Inventory",
              style: GoogleFonts.inter(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                  fontSize: 18)),
          backgroundColor: Colors.transparent,
          elevation: 0,
          iconTheme: const IconThemeData(color: Colors.white),
          centerTitle: true,
        ),
        body: Stack(
          children: [
            _buildHeader(),
            _buildContentBody(),
          ],
        ),
        bottomNavigationBar: _cart.isNotEmpty ? _buildSubmitButton() : null,
      ),
    );
  }

  // --- UI Helper Widgets ---

  Widget _buildHeader() {
    return Container(
      height: 220,
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 24).copyWith(top: 85),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [AppTheme.primaryDark, AppTheme.accentBlue],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "Requesting items for:",
            style: GoogleFonts.inter(
                fontSize: 14,
                color: Colors.white.withOpacity(0.9),
                fontWeight: FontWeight.w500),
          ),
          const SizedBox(height: 8),
          Text(
            widget.issueTitle,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.inter(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: Colors.white,
                height: 1.2),
          ),
          const SizedBox(height: 12),
          if (_cart.isNotEmpty) _buildCartSummary(),
        ],
      ),
    );
  }

  Widget _buildCartSummary() {
    final totalItems = _cart.values.fold(0, (sum, quantity) => sum + quantity);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.15),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          const Icon(CupertinoIcons.cart_fill, color: Colors.white, size: 18),
          const SizedBox(width: 8),
          Text(
            "$totalItems ${totalItems == 1 ? 'item' : 'items'} in cart",
            style: GoogleFonts.inter(
                color: Colors.white, fontWeight: FontWeight.w500, fontSize: 14),
          ),
        ],
      ),
    );
  }

  Widget _buildContentBody() {
    return Container(
      margin: const EdgeInsets.only(top: 200),
      decoration: const BoxDecoration(
        color: AppTheme.background,
        borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
      ),
      child: Column(
        children: [
          _buildSearchBar(),
          Expanded(
            child: BlocBuilder<InventoryBloc, InventoryState>(
              builder: (context, state) {
                if (state is InventoryLoading) {
                  return const Center(
                      child: CircularProgressIndicator(
                    valueColor:
                        AlwaysStoppedAnimation<Color>(AppTheme.accentBlue),
                  ));
                }
                if (state is InventoryLoaded) {
                  if (_filteredItems.isEmpty) {
                    return _buildEmptyState();
                  }
                  return ListView.builder(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                    itemCount: _filteredItems.length,
                    itemBuilder: (context, index) {
                      final item = _filteredItems[index];
                      return _buildInventoryItemTile(item);
                    },
                  );
                }
                return _buildErrorState();
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Container(
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: TextField(
          controller: _searchController,
          decoration: InputDecoration(
            hintText: "Search for items...",
            hintStyle: TextStyle(color: Colors.grey.shade500),
            prefixIcon:
                Icon(CupertinoIcons.search, color: Colors.grey.shade500),
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide.none,
            ),
            contentPadding: const EdgeInsets.symmetric(vertical: 16),
          ),
        ),
      ),
    );
  }

  Widget _buildInventoryItemTile(InventoryItem item) {
    final quantityInCart = _cart[item] ?? 0;
    final isLowStock = item.availableCount < 10;

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppTheme.accentBlue.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.inventory_2_outlined,
                color: AppTheme.accentBlue,
                size: 22,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.name,
                    style: const TextStyle(
                        fontWeight: FontWeight.w600, fontSize: 16),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Text(
                        "Available: ${item.availableCount} ${item.unit}",
                        style: TextStyle(
                          color: isLowStock
                              ? Colors.orange.shade700
                              : Colors.grey.shade600,
                          fontSize: 13,
                          fontWeight:
                              isLowStock ? FontWeight.w500 : FontWeight.normal,
                        ),
                      ),
                      if (isLowStock) ...[
                        const SizedBox(width: 6),
                        Icon(
                          Icons.warning_amber_rounded,
                          color: Colors.orange.shade700,
                          size: 14,
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
            Row(
              children: [
                IconButton(
                  icon: Icon(
                    CupertinoIcons.minus_circle_fill,
                    color: quantityInCart > 0
                        ? AppTheme.accentBlue
                        : Colors.grey.shade300,
                    size: 28,
                  ),
                  onPressed: quantityInCart > 0
                      ? () => _updateCart(item, quantityInCart - 1)
                      : null,
                ),
                Container(
                  width: 36,
                  alignment: Alignment.center,
                  child: Text(
                    quantityInCart.toString(),
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.primaryDark,
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(
                    CupertinoIcons.plus_circle_fill,
                    color: AppTheme.accentBlue,
                    size: 28,
                  ),
                  onPressed: () => _updateCart(item, quantityInCart + 1),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(
          Icons.search_off_rounded,
          size: 64,
          color: Colors.grey.shade400,
        ),
        const SizedBox(height: 16),
        Text(
          "No items found",
          style: GoogleFonts.inter(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: Colors.grey.shade600,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          "Try a different search term",
          style: GoogleFonts.inter(
            fontSize: 14,
            color: Colors.grey.shade500,
          ),
        ),
      ],
    );
  }

  Widget _buildErrorState() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(
          Icons.error_outline_rounded,
          size: 64,
          color: Colors.grey.shade400,
        ),
        const SizedBox(height: 16),
        Text(
          "Could not load inventory",
          style: GoogleFonts.inter(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: Colors.grey.shade600,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          "Please try again later",
          style: GoogleFonts.inter(
            fontSize: 14,
            color: Colors.grey.shade500,
          ),
        ),
      ],
    );
  }

  Widget _buildSubmitButton() {
    final totalItems = _cart.values.fold(0, (sum, quantity) => sum + quantity);

    return Container(
      padding: const EdgeInsets.all(16).copyWith(bottom: 24),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 12,
              offset: const Offset(0, -5))
        ],
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          minimumSize: const Size(double.infinity, 56),
          backgroundColor: AppTheme.accentYellow,
          foregroundColor: AppTheme.primaryDark,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          elevation: 0,
        ),
        onPressed: _isSubmitting ? null : _submitRequest,
        child: _isSubmitting
            // --- MODIFICATION --- Show a spinner when loading
            ? const CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(AppTheme.primaryDark),
              )
            : Text(
                "Submit Request ($totalItems ${totalItems == 1 ? 'item' : 'items'})",
                style: GoogleFonts.inter(
                    fontWeight: FontWeight.w700, fontSize: 16),
              ),
      ),
    );
  }
}
