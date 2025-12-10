import 'package:flutter/material.dart';

class JudgmentDetailsPage extends StatefulWidget {
  final Map<String, dynamic> judgmentData;

  const JudgmentDetailsPage({
    Key? key,
    required this.judgmentData,
  }) : super(key: key);

  @override
  State<JudgmentDetailsPage> createState() => _JudgmentDetailsPageState();
}

class _JudgmentDetailsPageState extends State<JudgmentDetailsPage> {
  String selectedView = 'Original'; // Original, Summary, Notes, Translated

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Judgment Details',
          style: TextStyle(
            color: Color(0xFF1E65AD),
            fontSize: 20,
            fontWeight: FontWeight.bold,
            fontFamily: 'Roboto',
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.share, color: Color(0xFF1E65AD)),
            onPressed: () {
              // Share functionality
            },
          ),
          IconButton(
            icon: const Icon(Icons.download, color: Color(0xFF1E65AD)),
            onPressed: () {
              // Download functionality
            },
          ),
          IconButton(
            icon: const Icon(Icons.bookmark_border, color: Color(0xFF1E65AD)),
            onPressed: () {
              // Bookmark functionality
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Judgment Information Section
              _buildInfoRow('Case Title', widget.judgmentData['title'] ?? 'N/A'),
              const SizedBox(height: 16),
              _buildInfoRow('Court', widget.judgmentData['court_name'] ?? 'N/A'),
              const SizedBox(height: 16),
              _buildInfoRow('Judge', widget.judgmentData['judge'] ?? 'N/A'),
              const SizedBox(height: 16),
              _buildInfoRow(
                'Decision Date',
                _formatDate(widget.judgmentData['decision_date'] ?? 'N/A'),
              ),
              const SizedBox(height: 16),
              _buildInfoRow('CNR Number', widget.judgmentData['cnr'] ?? 'N/A'),
              const SizedBox(height: 16),
              _buildDisposalNature(widget.judgmentData['disposal_nature'] ?? 'N/A'),
              const SizedBox(height: 16),
              _buildInfoRow('Year', widget.judgmentData['year']?.toString() ?? 'N/A'),
              const SizedBox(height: 16),
              _buildInfoRow('Case Information', widget.judgmentData['case_info'] ?? 'N/A'),
              
              const SizedBox(height: 24),
              
              // Back to Results Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.arrow_back, color: Colors.grey),
                  label: const Text(
                    'Back to Results',
                    style: TextStyle(
                      color: Colors.grey,
                      fontSize: 16,
                      fontFamily: 'Roboto',
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.grey[100],
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
              ),
              
              const SizedBox(height: 24),
              
              // Search Bar
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey[300]!),
                ),
                child: TextField(
                  decoration: InputDecoration(
                    hintText: 'Search With Kiki AI...',
                    hintStyle: TextStyle(
                      color: Colors.grey[600],
                      fontSize: 14,
                      fontFamily: 'Roboto',
                    ),
                    prefixIcon: Container(
                      margin: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF6C5CE7), Color(0xFFA29BFE)],
                        ),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.search, color: Colors.white, size: 20),
                    ),
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
              
              const SizedBox(height: 16),
              
              // Action Buttons Row
              Row(
                children: [
                  Expanded(
                    child: _buildActionButton(
                      'Summary',
                      Icons.flash_on,
                      selectedView == 'Summary',
                      () => setState(() => selectedView = 'Summary'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildActionButton(
                      'Notes',
                      Icons.note,
                      selectedView == 'Notes',
                      () => setState(() => selectedView = 'Notes'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildActionButton(
                      'Original',
                      Icons.description,
                      selectedView == 'Original',
                      () => setState(() => selectedView = 'Original'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildActionButton(
                      'Translated',
                      Icons.translate,
                      selectedView == 'Translated',
                      () => setState(() => selectedView = 'Translated'),
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 24),
              
              // Content Area based on selected view
              _buildContentView(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            color: Colors.grey[600],
            fontSize: 12,
            fontWeight: FontWeight.w500,
            fontFamily: 'Roboto',
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            color: Colors.black87,
            fontSize: 16,
            fontWeight: FontWeight.w400,
            fontFamily: 'Roboto',
          ),
        ),
      ],
    );
  }

  Widget _buildDisposalNature(String nature) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Disposal Nature',
          style: TextStyle(
            color: Colors.grey[600],
            fontSize: 12,
            fontWeight: FontWeight.w500,
            fontFamily: 'Roboto',
          ),
        ),
        const SizedBox(height: 4),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: const Color(0xFFE3F2FD),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFF1E65AD), width: 1),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: Color(0xFF1E65AD),
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 8),
              Text(
                nature.toUpperCase(),
                style: const TextStyle(
                  color: Color(0xFF1E65AD),
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  fontFamily: 'Roboto',
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildActionButton(
    String label,
    IconData icon,
    bool isSelected,
    VoidCallback onTap,
  ) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF1E65AD) : Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected ? const Color(0xFF1E65AD) : Colors.grey[300]!,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 18,
              color: isSelected ? Colors.white : Colors.grey[600],
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                color: isSelected ? Colors.white : Colors.grey[600],
                fontSize: 12,
                fontWeight: FontWeight.w500,
                fontFamily: 'Roboto',
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContentView() {
    switch (selectedView) {
      case 'Summary':
        return const Center(
          child: Padding(
            padding: EdgeInsets.all(32.0),
            child: Text(
              'Summary content will be displayed here',
              style: TextStyle(
                color: Colors.grey,
                fontSize: 14,
                fontFamily: 'Roboto',
              ),
            ),
          ),
        );
      case 'Notes':
        return const Center(
          child: Padding(
            padding: EdgeInsets.all(32.0),
            child: Text(
              'Notes content will be displayed here',
              style: TextStyle(
                color: Colors.grey,
                fontSize: 14,
                fontFamily: 'Roboto',
              ),
            ),
          ),
        );
      case 'Original':
        return Container(
          width: double.infinity,
          height: 400,
          decoration: BoxDecoration(
            color: Colors.grey[100],
            borderRadius: BorderRadius.circular(8),
          ),
          child: const Center(
            child: Text(
              'Original PDF content will be displayed here',
              style: TextStyle(
                color: Colors.grey,
                fontSize: 14,
                fontFamily: 'Roboto',
              ),
            ),
          ),
        );
      case 'Translated':
        return const Center(
          child: Padding(
            padding: EdgeInsets.all(32.0),
            child: Text(
              'Translated content will be displayed here',
              style: TextStyle(
                color: Colors.grey,
                fontSize: 14,
                fontFamily: 'Roboto',
              ),
            ),
          ),
        );
      default:
        return const SizedBox.shrink();
    }
  }

  String _formatDate(String dateStr) {
    try {
      // Format: 2025-01-23 -> 23/01/2025
      if (dateStr.contains('-')) {
        final parts = dateStr.split('-');
        if (parts.length == 3) {
          return '${parts[2]}/${parts[1]}/${parts[0]}';
        }
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  }
}

// Example usage:
void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Judgment Details',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        fontFamily: 'Roboto',
      ),
      home: JudgmentDetailsPage(
        judgmentData: {
          'title': 'ANIL PAL VS RAJAT GUPTA',
          'court_name': 'High Court of Uttarakhand',
          'judge': "HON'BLE MR. JUSTICE PANKAJ PUROHIT",
          'decision_date': '2025-10-17',
          'cnr': 'UKHC010166172025',
          'disposal_nature': 'DISPOSED',
          'year': 2025,
          'case_info': 'C528/1885/2025',
        },
      ),
    );
  }
}

