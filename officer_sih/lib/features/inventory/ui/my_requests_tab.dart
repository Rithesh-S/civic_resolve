import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:municipal_officer_app/features/inventory/models/expense_request_model.dart';

class MyRequestsTab extends StatelessWidget {
  final List<ExpenseRequest> requests;
  const MyRequestsTab({super.key, required this.requests});

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

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: requests.length,
      itemBuilder: (context, index) {
        final request = requests[index];
        final statusInfo = _getStatusProperties(request.status);
        //  final itemsString = request.items
        //     .map((item) => '${item.name} (${item.quantity})')
        //     .join(', ');
        return Card(
          elevation: 1,
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            contentPadding: const EdgeInsets.all(16),
            title: Text("For: ${request.issue.title}", style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 8),
                Text("Items: ${request.items.join(', ')}"),
                const SizedBox(height: 4),
                Text(
                    "Requested on: ${DateFormat('dd MMM, yyyy').format(request.requestedAt)}"),
              ],
            ),
            trailing: Chip(
              label: Text(statusInfo['text']),
              backgroundColor: statusInfo['color'].withOpacity(0.1),
              labelStyle: TextStyle(color: statusInfo['color'], fontWeight: FontWeight.bold),
            ),
          ),
        );
      },
    );
  }
}