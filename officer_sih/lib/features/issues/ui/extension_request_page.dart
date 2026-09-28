import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import 'package:municipal_officer_app/features/extensions/bloc/extension_bloc.dart';
import 'package:municipal_officer_app/features/extensions/bloc/extension_event.dart';
import 'package:municipal_officer_app/features/extensions/bloc/extension_state.dart';

class ExtensionRequestPage extends StatefulWidget {
  final String issueId;
  const ExtensionRequestPage({super.key, required this.issueId});

  @override
  State<ExtensionRequestPage> createState() => _ExtensionRequestPageState();
}

class _ExtensionRequestPageState extends State<ExtensionRequestPage> {
  final _formKey = GlobalKey<FormState>();
  final _reasonController = TextEditingController();
  DateTime? _selectedDate;
  bool _isLoading = false;

  @override
  void dispose() {
    _reasonController.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final pickedDate = await showDatePicker(
      context: context,
      initialDate: now.add(const Duration(days: 1)),
      firstDate: now.add(const Duration(days: 1)),
      lastDate: now.add(const Duration(days: 30)),
    );

    if (pickedDate != null) {
      setState(() {
        _selectedDate = pickedDate;
      });
    }
  }

  void _submitRequest() {
    if (_formKey.currentState!.validate()) {
      if (_selectedDate == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please select a new due date.')),
        );
        return;
      }
      context.read<ExtensionBloc>().add(AddExtensionRequest(
            issueId: widget.issueId,
            requestedUntil: _selectedDate!,
            reason: _reasonController.text,
          ));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Request Extension")),
      body: BlocListener<ExtensionBloc, ExtensionState>(
        listener: (context, state) {
          if (state is ExtensionSubmitting) {
            setState(() => _isLoading = true);
          }
          if (state is ExtensionSubmitSuccess) {
            setState(() => _isLoading = false);
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                  content: Text('Extension request submitted successfully!'),
                  backgroundColor: Colors.green),
            );
            Navigator.of(context).pop();
          }
          if (state is ExtensionSubmitFailure) {
            setState(() => _isLoading = false);
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                  content: Text('Error: ${state.error}'),
                  backgroundColor: Colors.red),
            );
          }
        },
        child: Form(
          key: _formKey,
          child: ListView(
            padding: const EdgeInsets.all(16.0),
            children: [
              Text("Request Time Extension",
                  style: Theme.of(context).textTheme.headlineSmall),
              const SizedBox(height: 24),
              // Date Picker Input
              GestureDetector(
                onTap: _pickDate,
                child: AbsorbPointer(
                  child: TextFormField(
                    key: ValueKey(_selectedDate), // Rebuilds when date changes
                    initialValue: _selectedDate == null
                        ? ''
                        : DateFormat('dd MMMM, yyyy').format(_selectedDate!),
                    decoration: const InputDecoration(
                      labelText: 'New Requested Due Date*',
                      suffixIcon: Icon(CupertinoIcons.calendar),
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              // Reason Input
              TextFormField(
                controller: _reasonController,
                decoration: const InputDecoration(
                  labelText: 'Reason for Extension*',
                  hintText: 'Provide a clear justification...',
                  border: OutlineInputBorder(),
                ),
                maxLines: 5,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Please enter a reason.';
                  }
                  if (value.length < 10) {
                    return 'Reason must be at least 10 characters long.';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),
              // Submit Button
              ElevatedButton.icon(
                icon: _isLoading
                    ? Container(
                        width: 24,
                        height: 24,
                        padding: const EdgeInsets.all(2.0),
                        child: const CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 3,
                        ),
                      )
                    : const Icon(Icons.send),
                label: const Text('Submit Request'),
                onPressed: _isLoading ? null : _submitRequest,
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 50),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}