// src/utils/dummyData.js
export const dummyData = {
  users: [
    {
      _id: 'user1',
      fullName: 'Admin User',
      email: 'admin@jharkhand.gov.in',
      phone: '+919876543210',
      passwordHash: 'hashed_password_123',
      role: 'admin',
      preferredLanguage: 'en',
      createdAt: new Date('2023-01-15T10:00:00Z'),
      updatedAt: new Date('2023-06-20T14:30:00Z'),
    },
    {
      _id: 'user2',
      fullName: 'Rajesh Kumar',
      email: 'rajesh@jharkhand.gov.in',
      phone: '+919876543211',
      passwordHash: 'hashed_password_456',
      role: 'officer',
      officerProfile: {
        officerCode: 'OFF-001',
        ulbId: 'ulb1',
        wardId: 'ward1',
        department: 'Public Works',
        roleTitle: 'JE',
        supervisorId: 'user3',
        status: 'active',
      },
      preferredLanguage: 'hi',
      createdAt: new Date('2023-02-10T09:15:00Z'),
      updatedAt: new Date('2023-06-20T16:45:00Z'),
    },
    {
      _id: 'user3',
      fullName: 'Priya Sharma',
      email: 'priya@jharkhand.gov.in',
      phone: '+919876543212',
      passwordHash: 'hashed_password_789',
      role: 'officer',
      officerProfile: {
        officerCode: 'OFF-002',
        ulbId: 'ulb1',
        wardId: 'ward2',
        department: 'Sanitation',
        roleTitle: 'SI',
        supervisorId: 'user1',
        status: 'active',
      },
      preferredLanguage: 'en',
      createdAt: new Date('2023-03-05T11:20:00Z'),
      updatedAt: new Date('2023-06-19T10:30:00Z'),
    },
    {
      _id: 'user4',
      fullName: 'Amit Singh',
      email: 'amit@jharkhand.gov.in',
      phone: '+919876543213',
      passwordHash: 'hashed_password_101',
      role: 'officer',
      officerProfile: {
        officerCode: 'OFF-003',
        ulbId: 'ulb1',
        wardId: 'ward3',
        department: 'Electrical',
        roleTitle: 'AE',
        supervisorId: 'user1',
        status: 'on_leave',
      },
      preferredLanguage: 'hi',
      createdAt: new Date('2023-04-12T08:45:00Z'),
      updatedAt: new Date('2023-06-18T15:20:00Z'),
    },
    {
      _id: 'citizen1',
      fullName: 'Ravi Mishra',
      email: 'ravi.mishra@example.com',
      phone: '+919876543214',
      passwordHash: 'hashed_password_102',
      role: 'citizen',
      preferredLanguage: 'hi',
      createdAt: new Date('2023-05-01T14:20:00Z'),
      updatedAt: new Date('2023-06-15T11:30:00Z'),
    },
    {
      _id: 'citizen2',
      fullName: 'Sunita Devi',
      email: 'sunita@example.com',
      phone: '+919876543215',
      passwordHash: 'hashed_password_103',
      role: 'citizen',
      preferredLanguage: 'hi',
      createdAt: new Date('2023-05-10T16:40:00Z'),
      updatedAt: new Date('2023-06-16T09:15:00Z'),
    }
  ],
  
  issues: [
    {
      _id: 'issue1',
      reporterId: 'citizen1',
      ulbId: 'ulb1',
      channel: 'app',
      title: 'Pothole on Main Road',
      description: 'Large pothole causing traffic issues near the market area. Vehicles are getting stuck and it\'s becoming a safety hazard.',
      category: 'Roads',
      status: 'in_progress',
      location: {
        type: 'Point',
        coordinates: [85.3096, 23.3441],
      },
      wardId: 'ward1',
      priority: 1,
      assignedOfficerId: 'user2',
      media: [
        {
          url: '/dummy/pothole1.jpg',
          type: 'image',
          role: 'evidence',
        },
        {
          url: '/dummy/pothole2.jpg',
          type: 'image',
          role: 'evidence',
        }
      ],
      verification: {
        status: 'success',
        confidenceScore: 0.92,
        isDuplicate: false,
        duplicateOfIssueId: null, // Added missing field
      },
      slaDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      statusHistory: [
        {
          status: 'submitted',
          updatedBy: 'system',
          timestamp: new Date('2023-06-15T10:30:00Z'),
        },
        {
          status: 'verified',
          updatedBy: 'user1',
          timestamp: new Date('2023-06-15T11:15:00Z'),
        },
        {
          status: 'acknowledged',
          updatedBy: 'user2',
          timestamp: new Date('2023-06-15T14:20:00Z'),
        },
        {
          status: 'in_progress',
          updatedBy: 'user2',
          timestamp: new Date('2023-06-16T09:45:00Z'),
        },
      ],
      citizenFeedback: {
        rating: 4,
        comment: 'Quick response but still waiting for resolution',
      },
      upvotes: 12, // Kept as requested
      createdAt: new Date('2023-06-15T10:30:00Z'),
      acknowledgedAt: new Date('2023-06-15T14:20:00Z'),
      resolvedAt: null,
      updatedAt: new Date('2023-06-16T09:45:00Z'),
    },
    {
      _id: 'issue2',
      reporterId: 'citizen2',
      ulbId: 'ulb1',
      channel: 'app',
      title: 'Overflowing Garbage Bin',
      description: 'Garbage bin near community park is overflowing for past 3 days. Creating unhygienic conditions and bad smell.',
      category: 'Sanitation',
      status: 'resolved',
      location: {
        type: 'Point',
        coordinates: [85.3123, 23.3428],
      },
      wardId: 'ward2',
      priority: 2,
      assignedOfficerId: 'user3',
      media: [
        {
          url: '/dummy/garbage1.jpg',
          type: 'image',
          role: 'evidence',
        },
        {
          url: '/dummy/garbage2.jpg',
          type: 'image',
          role: 'after',
        }
      ],
      verification: {
        status: 'success',
        confidenceScore: 0.88,
        isDuplicate: false,
        duplicateOfIssueId: null, // Added missing field
      },
      slaDueDate: new Date('2023-06-18T23:59:59Z'),
      statusHistory: [
        {
          status: 'submitted',
          updatedBy: 'system',
          timestamp: new Date('2023-06-12T14:20:00Z'),
        },
        {
          status: 'verified',
          updatedBy: 'user1',
          timestamp: new Date('2023-06-12T15:30:00Z'),
        },
        {
          status: 'acknowledged',
          updatedBy: 'user3',
          timestamp: new Date('2023-06-12T16:45:00Z'),
        },
        {
          status: 'in_progress',
          updatedBy: 'user3',
          timestamp: new Date('2023-06-13T09:15:00Z'),
        },
        {
          status: 'resolved',
          updatedBy: 'user3',
          timestamp: new Date('2023-06-13T16:30:00Z'),
        },
      ],
      citizenFeedback: {
        rating: 5,
        comment: 'Excellent service! The area was cleaned within 24 hours.',
      },
      upvotes: 8, // Kept as requested
      createdAt: new Date('2023-06-12T14:20:00Z'),
      acknowledgedAt: new Date('2023-06-12T16:45:00Z'),
      resolvedAt: new Date('2023-06-13T16:30:00Z'),
      updatedAt: new Date('2023-06-13T16:30:00Z'),
    },
    {
      _id: 'issue3',
      reporterId: 'citizen1',
      ulbId: 'ulb1',
      channel: 'web',
      title: 'Street Light Not Working',
      description: 'Street light pole number 45 is not working for past week. Making the area unsafe at night.',
      category: 'Streetlight',
      status: 'submitted',
      location: {
        type: 'Point',
        coordinates: [85.3087, 23.3462],
      },
      wardId: 'ward3',
      priority: 3,
      assignedOfficerId: null,
      media: [
        {
          url: '/dummy/streetlight1.jpg',
          type: 'image',
          role: 'evidence',
        }
      ],
      verification: {
        status: 'pending',
        confidenceScore: 0.75,
        isDuplicate: false,
        duplicateOfIssueId: null, // Added missing field
      },
      slaDueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      statusHistory: [
        {
          status: 'submitted',
          updatedBy: 'system',
          timestamp: new Date('2023-06-17T18:45:00Z'),
        },
      ],
      citizenFeedback: null,
      upvotes: 3, // Kept as requested
      createdAt: new Date('2023-06-17T18:45:00Z'),
      acknowledgedAt: null,
      resolvedAt: null,
      updatedAt: new Date('2023-06-17T18:45:00Z'),
    }
  ],
  
  inventory: [
    {
      _id: 'inv1',
      ulbId: 'ulb1',
      name: 'LED Streetlight Bulb',
      description: '20W LED bulb for streetlights with 5-year warranty',
      category: 'Electrical',
      image: '/dummy/led-bulb.jpg',
      availableCount: 150,
      unit: 'pieces',
      unitCost: 350,
      metadata: {
        lastUpdated: new Date('2023-06-18T10:30:00Z'),
        storageLocation: 'Main Warehouse, Zone A',
      },
    },
    {
      _id: 'inv2',
      ulbId: 'ulb1',
      name: 'Asphalt Mix',
      description: 'Hot mix asphalt for road repairs',
      category: 'Construction',
      image: '/dummy/asphalt.jpg',
      availableCount: 25,
      unit: 'kg',
      unitCost: 45,
      metadata: {
        lastUpdated: new Date('2023-06-17T14:20:00Z'),
        storageLocation: 'Outdoor Storage, Zone C',
      },
    },
    {
      _id: 'inv3',
      ulbId: 'ulb1',
      name: 'Garbage Bin Liners',
      description: 'Heavy-duty plastic liners for public garbage bins',
      category: 'Sanitation',
      image: '/dummy/bin-liners.jpg',
      availableCount: 500,
      unit: 'pieces',
      unitCost: 12,
      metadata: {
        lastUpdated: new Date('2023-06-19T09:15:00Z'),
        storageLocation: 'Main Warehouse, Zone B',
      },
    },
    {
      _id: 'inv4',
      ulbId: 'ulb1',
      name: 'Concrete Mix',
      description: 'Ready-mix concrete for construction and repairs',
      category: 'Construction',
      image: '/dummy/concrete.jpg',
      availableCount: 15,
      unit: 'kg',
      unitCost: 28,
      metadata: {
        lastUpdated: new Date('2023-06-16T16:45:00Z'),
        storageLocation: 'Outdoor Storage, Zone D',
      },
    }
  ],
  
  inventoryRequests: [
    {
      _id: 'ir1',
      issueId: 'issue1',
      ulbId: 'ulb1',
      officerId: 'user2',
      items: [
        {
          inventoryId: 'inv2',
          name: 'Asphalt Mix',
          quantity: 50,
          unitCost: 45,
          totalCost: 2250,
        },
      ],
      status: 'approved',
      requestedAt: new Date('2023-06-16T10:30:00Z'),
      approvedBy: 'user1',
      approvedAt: new Date('2023-06-16T11:45:00Z'),
    },
    {
      _id: 'ir2',
      issueId: 'issue2',
      ulbId: 'ulb1',
      officerId: 'user3',
      items: [
        {
          inventoryId: 'inv3',
          name: 'Garbage Bin Liners',
          quantity: 10,
          unitCost: 12,
          totalCost: 120,
        },
      ],
      status: 'approved',
      requestedAt: new Date('2023-06-13T09:30:00Z'),
      approvedBy: 'user1',
      approvedAt: new Date('2023-06-13T10:15:00Z'),
    },
    {
      _id: 'ir3',
      issueId: 'issue3',
      ulbId: 'ulb1',
      officerId: 'user4',
      items: [
        {
          inventoryId: 'inv1',
          name: 'LED Streetlight Bulb',
          quantity: 2,
          unitCost: 350,
          totalCost: 700,
        },
        {
          inventoryId: 'inv4',
          name: 'Concrete Mix',
          quantity: 5,
          unitCost: 28,
          totalCost: 140,
        }
      ],
      status: 'requested',
      requestedAt: new Date('2023-06-18T14:20:00Z'),
      approvedBy: null,
      approvedAt: null,
    }
  ],
  
  issueextensionrequest: [ // Changed collection name to match schema
    {
      _id: 'sla1',
      issueId: 'issue1',
      ulbId: 'ulb1',
      officerId: 'user2',
      requestedUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      reason: 'Waiting for materials delivery and favorable weather conditions for road work',
      status: 'approved',
      reviewedBy: 'user1',
      reviewedAt: new Date('2023-06-17T09:30:00Z'),
      createdAt: new Date('2023-06-16T16:45:00Z'),
    },
    {
      _id: 'sla2',
      issueId: 'issue3',
      ulbId: 'ulb1',
      officerId: 'user4',
      requestedUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      reason: 'Specialized equipment required for street light repair',
      status: 'pending',
      reviewedBy: null,
      reviewedAt: null,
      createdAt: new Date('2023-06-18T15:20:00Z'),
    }
  ],
  
  notifications: [
    {
      _id: 'notif1',
      userId: 'user1',
      ulbId: 'ulb1',
      channel: 'push',
      title: 'New Issue Reported',
      message: 'Pothole on Main Road reported by citizen Ravi Mishra',
      isRead: true,
      relatedIssueId: 'issue1',
      createdAt: new Date('2023-06-15T10:31:00Z'),
    },
    {
      _id: 'notif2',
      userId: 'user1',
      ulbId: 'ulb1',
      channel: 'push',
      title: 'Inventory Request Pending',
      message: 'New inventory request for Street Light repair needs approval',
      isRead: false,
      relatedIssueId: 'issue3',
      createdAt: new Date('2023-06-18T14:25:00Z'),
    },
    {
      _id: 'notif3',
      userId: 'user2',
      ulbId: 'ulb1',
      channel: 'push',
      title: 'Issue Assigned',
      message: 'Pothole on Main Road has been assigned to you',
      isRead: true,
      relatedIssueId: 'issue1',
      createdAt: new Date('2023-06-15T14:21:00Z'),
    },
    {
      _id: 'notif4',
      userId: 'user1',
      ulbId: 'ulb1',
      channel: 'email',
      title: 'SLA Extension Request',
      message: 'Officer Rajesh Kumar requested SLA extension for Pothole issue',
      isRead: true,
      relatedIssueId: 'issue1',
      createdAt: new Date('2023-06-16T16:50:00Z'),
    }
  ],
};

// Additional helper data
export const wards = [
  { _id: 'ward1', name: 'Ward 1', code: 'W001' },
  { _id: 'ward2', name: 'Ward 2', code: 'W002' },
  { _id: 'ward3', name: 'Ward 3', code: 'W003' },
  { _id: 'ward4', name: 'Ward 4', code: 'W004' },
  { _id: 'ward5', name: 'Ward 5', code: 'W005' },
];

export const ulbs = [
  { _id: 'ulb1', name: 'Ranchi Municipal Corporation', code: 'RMC' },
  { _id: 'ulb2', name: 'Jamshedpur Municipal Corporation', code: 'JMC' },
  { _id: 'ulb3', name: 'Dhanbad Municipal Corporation', code: 'DMC' },
];

export default dummyData;