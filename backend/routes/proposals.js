import express from 'express'
import Proposal from '../models/Proposal.js'
import Student from '../models/Student.js'
import Teacher from '../models/Teacher.js'
import { authenticateToken, authorizeAdmin } from '../middleware/auth.js'
import { createNotification } from './notifications.js'

const router = express.Router()

// ============ SPECIFIC ROUTES FIRST (before dynamic routes) ============

// Get all proposals (admin view)
router.get('/all', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const proposals = await Proposal.find().sort({ submittedAt: -1 })
    res.json({ success: true, proposals })
  } catch (error) {
    console.error('Error fetching all proposals:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Get approved proposals (for assigning supervisors)
router.get('/approved', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const proposals = await Proposal.find({ status: 'approved' }).sort({ submittedAt: -1 })
    res.json({ success: true, proposals })
  } catch (error) {
    console.error('Error fetching approved proposals:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Get assigned projects (status: assigned)
router.get('/assigned', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const proposals = await Proposal.find({ status: 'assigned' }).sort({ submittedAt: -1 })
    res.json({ success: true, proposals })
  } catch (error) {
    console.error('Error fetching assigned proposals:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Get all students assigned to a teacher (for teacher dashboard)
router.get('/my-students', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ success: false, message: 'Only teachers can access this endpoint' })
    }

    console.log('Fetching students for teacher ID:', req.user.id)

    // Find all proposals where this teacher is assigned as supervisor
    const proposals = await Proposal.find({ 
      'assignedSupervisor.id': req.user.id,
      status: 'assigned'
    }).sort({ submittedAt: -1 })

    console.log(`Found ${proposals.length} students assigned to this teacher`)

    if (!proposals || proposals.length === 0) {
      return res.json({ 
        success: true, 
        hasStudents: false, 
        students: [],
        message: 'No students assigned yet' 
      })
    }

    const studentsList = proposals.map(proposal => ({
      studentId: proposal.studentId,
      studentName: proposal.studentName,
      rollNumber: proposal.rollNumber,
      email: proposal.email,
      department: proposal.department,
      semester: proposal.semester,
      projectTitle: proposal.projectTitle,
      projectDescription: proposal.projectDescription,
      projectStatus: proposal.status,
      submittedAt: proposal.submittedAt,
      proposalId: proposal._id,
      deadlines: proposal.deadlines || []
    }))

    res.json({ 
      success: true, 
      hasStudents: true,
      students: studentsList,
      totalCount: studentsList.length
    })
  } catch (error) {
    console.error('Error fetching assigned students:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Get all assigned supervisors for a student (all proposals)
router.get('/my-supervisors', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can access this endpoint' })
    }

    console.log('Fetching supervisors for student ID:', req.user.id)

    const proposals = await Proposal.find({ 
      studentId: req.user.id,
      assignedSupervisor: { $exists: true, $ne: null }
    }).sort({ submittedAt: -1 })

    console.log(`Found ${proposals.length} proposals with supervisors for student`)

    if (!proposals || proposals.length === 0) {
      return res.json({ 
        success: true, 
        hasSupervisors: false, 
        message: 'No supervisors assigned yet' 
      })
    }

    const supervisorsList = proposals.map(proposal => ({
      projectTitle: proposal.projectTitle,
      projectStatus: proposal.status,
      supervisor: proposal.assignedSupervisor,
      proposalId: proposal._id,
      submittedAt: proposal.submittedAt,
      rollNumber: proposal.rollNumber,
      department: proposal.department,
      semester: proposal.semester
    }))

    res.json({ 
      success: true, 
      hasSupervisors: true,
      supervisors: supervisorsList,
      totalCount: supervisorsList.length,
      studentId: req.user.id
    })
  } catch (error) {
    console.error('Error fetching supervisors:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Get all teachers (supervisors) for dropdown
router.get('/teachers/list', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const teachers = await Teacher.find({ status: 'active' }).select('name email employeeId department')
    res.json({ success: true, teachers })
  } catch (error) {
    console.error('Error fetching teachers:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Get all proposals for a student (student view)
router.get('/my-proposals', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can access this endpoint' })
    }
    
    const proposals = await Proposal.find({ studentId: req.user.id }).sort({ submittedAt: -1 })
    res.json({ success: true, proposals })
  } catch (error) {
    console.error('Error fetching proposals:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// ============ DYNAMIC ROUTES (with :id parameter) GO LAST ============

// Get single proposal by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' })
    }
    if (proposal.studentId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' })
    }
    res.json({ success: true, proposal })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Submit new proposal
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can submit proposals' })
    }

    const { projectTitle, projectDescription, technologies, objectives, expectedOutcomes } = req.body

    if (!projectTitle || !projectDescription) {
      return res.status(400).json({ success: false, message: 'Project title and description are required' })
    }

    const student = await Student.findById(req.user.id)
    
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' })
    }

    const proposal = new Proposal({
      studentId: student._id,
      studentName: student.name,
      rollNumber: student.rollNumber,
      semester: student.semester,
      department: student.department,
      email: student.email,
      projectTitle,
      projectDescription,
      technologies: technologies || '',
      objectives: objectives || '',
      expectedOutcomes: expectedOutcomes || '',
      status: 'pending'
    })

    await proposal.save()

    await createNotification(
      student._id.toString(),
      'student',
      'submission',
      'Proposal Submitted',
      `Your project proposal "${projectTitle}" has been submitted successfully and is pending review.`,
      proposal._id.toString()
    )

    res.status(201).json({ 
      success: true, 
      message: 'Proposal submitted successfully', 
      proposal 
    })
  } catch (error) {
    console.error('Error submitting proposal:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Update proposal status (admin only)
router.put('/:id/status', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { status, feedback } = req.body
    const proposal = await Proposal.findById(req.params.id)
    
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' })
    }
    
    proposal.status = status
    if (feedback) proposal.feedback = feedback
    proposal.updatedAt = Date.now()
    
    await proposal.save()
    
    let title, message, type
    if (status === 'approved') {
      title = 'Proposal Approved'
      message = `Your project proposal "${proposal.projectTitle}" has been approved by the admin.`
      type = 'approval'
    } else if (status === 'rejected') {
      title = 'Proposal Rejected'
      message = `Your project proposal "${proposal.projectTitle}" has been rejected. Feedback: ${feedback || 'No feedback provided'}`
      type = 'rejection'
    } else if (status === 'revision') {
      title = 'Revision Required'
      message = `Your project proposal "${proposal.projectTitle}" needs revision. Feedback: ${feedback || 'Please make necessary changes'}`
      type = 'revision'
    }
    
    await createNotification(
      proposal.studentId.toString(),
      'student',
      type,
      title,
      message,
      proposal._id.toString()
    )
    
    res.json({ success: true, message: `Proposal ${status} successfully`, proposal })
  } catch (error) {
    console.error('Error updating proposal status:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Assign supervisor to a proposal
router.put('/:id/assign-supervisor', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { supervisorId, supervisorName, supervisorEmail } = req.body
    const proposal = await Proposal.findById(req.params.id)
    
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' })
    }
    
    proposal.assignedSupervisor = {
      id: supervisorId,
      name: supervisorName,
      email: supervisorEmail,
      assignedAt: new Date()
    }
    proposal.status = 'assigned'
    proposal.updatedAt = Date.now()
    
    await proposal.save()
    
    await createNotification(
      proposal.studentId.toString(),
      'student',
      'assignment',
      'Supervisor Assigned',
      `Supervisor ${supervisorName} has been assigned to your project "${proposal.projectTitle}". You can now contact them.`,
      proposal._id.toString()
    )
    
    await createNotification(
      supervisorId.toString(),
      'teacher',
      'assignment',
      'New Project Assigned',
      `You have been assigned as supervisor for "${proposal.projectTitle}" by ${proposal.studentName} (${proposal.rollNumber}).`,
      proposal._id.toString()
    )
    
    res.json({ success: true, message: 'Supervisor assigned successfully', proposal })
  } catch (error) {
    console.error('Error assigning supervisor:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Change/Update assigned supervisor for a proposal
router.put('/:id/change-supervisor', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { supervisorId, supervisorName, supervisorEmail } = req.body
    const proposal = await Proposal.findById(req.params.id)
    
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' })
    }
    
    const oldSupervisorName = proposal.assignedSupervisor?.name || 'Unknown'
    
    proposal.assignedSupervisor = {
      id: supervisorId,
      name: supervisorName,
      email: supervisorEmail,
      assignedAt: new Date()
    }
    proposal.updatedAt = Date.now()
    
    await proposal.save()
    
    await createNotification(
      proposal.studentId.toString(),
      'student',
      'assignment',
      'Supervisor Changed',
      `Your supervisor has been changed from ${oldSupervisorName} to ${supervisorName} for project "${proposal.projectTitle}".`,
      proposal._id.toString()
    )
    
    await createNotification(
      supervisorId.toString(),
      'teacher',
      'assignment',
      'New Project Assigned',
      `You have been assigned as supervisor for "${proposal.projectTitle}" by ${proposal.studentName} (${proposal.rollNumber}).`,
      proposal._id.toString()
    )
    
    res.json({ success: true, message: 'Supervisor changed successfully', proposal })
  } catch (error) {
    console.error('Error changing supervisor:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Update proposal (student revision)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can update proposals' })
    }
    
    const proposal = await Proposal.findById(req.params.id)
    
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' })
    }
    
    if (proposal.studentId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' })
    }
    
    if (proposal.status !== 'rejected' && proposal.status !== 'revision') {
      return res.status(400).json({ success: false, message: 'Cannot update proposal in current status' })
    }
    
    const { projectTitle, projectDescription, technologies, objectives, expectedOutcomes } = req.body
    
    proposal.projectTitle = projectTitle || proposal.projectTitle
    proposal.projectDescription = projectDescription || proposal.projectDescription
    proposal.technologies = technologies || proposal.technologies
    proposal.objectives = objectives || proposal.objectives
    proposal.expectedOutcomes = expectedOutcomes || proposal.expectedOutcomes
    proposal.status = 'pending'
    proposal.updatedAt = Date.now()
    
    await proposal.save()
    
    await createNotification(
      proposal.studentId.toString(),
      'student',
      'submission',
      'Proposal Resubmitted',
      `Your revised proposal "${proposal.projectTitle}" has been resubmitted for review.`,
      proposal._id.toString()
    )
    
    res.json({ success: true, message: 'Proposal updated successfully', proposal })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Delete proposal
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' })
    }
    
    const proposal = await Proposal.findById(req.params.id)
    
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' })
    }
    
    if (proposal.studentId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' })
    }
    
    await Proposal.findByIdAndDelete(req.params.id)
    
    res.json({ success: true, message: 'Proposal deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})





// Add deadline to a proposal (teacher only)
router.post('/:id/deadlines', authenticateToken, async (req, res) => {
  try {
    console.log('=== ADD DEADLINE REQUEST ===');
    console.log('User:', req.user);
    console.log('Proposal ID:', req.params.id);
    console.log('Request body:', req.body);
    
    // Check if user is teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ success: false, message: 'Only teachers can add deadlines' });
    }

    const { dueDate } = req.body;
    if (!dueDate) {
      return res.status(400).json({ success: false, message: 'Due date is required' });
    }
    
    // Find the proposal
    const proposal = await Proposal.findById(req.params.id);
    
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }
    
    console.log('Found proposal:', proposal.projectTitle);
    console.log('Assigned supervisor:', proposal.assignedSupervisor);
    console.log('Current teacher ID:', req.user.id);
    
    // Check if this teacher is the assigned supervisor
    const assignedId = proposal.assignedSupervisor?.id?.toString();
    const teacherId = req.user.id?.toString();
    
    if (assignedId !== teacherId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not assigned to this project',
        debug: { assignedId, teacherId }
      });
    }
    
    // Initialize deadlines array if it doesn't exist
    if (!proposal.deadlines) {
      proposal.deadlines = [];
    }
    
    // Create new deadline
    const newDeadline = {
      dueDate: new Date(dueDate),
      status: 'pending',
      createdAt: new Date()
    };
    
    proposal.deadlines.push(newDeadline);
    proposal.updatedAt = Date.now();
    
    await proposal.save();
    
    console.log('Deadline added successfully:', newDeadline);
    console.log('Total deadlines now:', proposal.deadlines.length);
    
    // Create notification for student
    try {
      await createNotification(
        proposal.studentId.toString(),
        'student',
        'deadline',
        'New Deadline Added',
        `Teacher ${req.user.name} has added a new deadline for your project "${proposal.projectTitle}". Due date: ${new Date(dueDate).toLocaleDateString()}`,
        proposal._id.toString()
      );
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'Deadline added successfully', 
      deadline: newDeadline,
      deadlines: proposal.deadlines
    });
    
  } catch (error) {
    console.error('Error adding deadline:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all deadlines for a proposal
router.get('/:id/deadlines', authenticateToken, async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }
    
    // Check access
    if (req.user.role === 'student' && proposal.studentId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    if (req.user.role === 'teacher' && proposal.assignedSupervisor?.id?.toString() !== req.user.id?.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    const deadlines = proposal.deadlines || [];
    res.json({ success: true, deadlines });
    
  } catch (error) {
    console.error('Error fetching deadlines:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update deadline due date (teacher only)
router.put('/:proposalId/deadlines/:deadlineId', authenticateToken, async (req, res) => {
  try {
    console.log('=== EDIT DEADLINE REQUEST ===');
    console.log('Proposal ID:', req.params.proposalId);
    console.log('Deadline ID:', req.params.deadlineId);
    console.log('New due date:', req.body.dueDate);
    
    // Check if user is teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ success: false, message: 'Only teachers can edit deadlines' });
    }
    
    const { dueDate } = req.body;
    if (!dueDate) {
      return res.status(400).json({ success: false, message: 'Due date is required' });
    }
    
    const proposal = await Proposal.findById(req.params.proposalId);
    
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }
    
    // Check if teacher is assigned
    if (proposal.assignedSupervisor?.id?.toString() !== req.user.id?.toString()) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this project' });
    }
    
    if (!proposal.deadlines || proposal.deadlines.length === 0) {
      return res.status(404).json({ success: false, message: 'No deadlines found' });
    }
    
    // Find and update the deadline
    const deadline = proposal.deadlines.id(req.params.deadlineId);
    if (!deadline) {
      return res.status(404).json({ success: false, message: 'Deadline not found' });
    }
    
    const oldDueDate = deadline.dueDate;
    deadline.dueDate = new Date(dueDate);
    proposal.updatedAt = Date.now();
    await proposal.save();
    
    console.log('Deadline updated successfully');
    
    // Create notification for student about deadline change
    try {
      await createNotification(
        proposal.studentId.toString(),
        'student',
        'deadline',
        'Deadline Updated',
        `Teacher ${req.user.name} has changed the deadline for your project "${proposal.projectTitle}" from ${new Date(oldDueDate).toLocaleDateString()} to ${new Date(dueDate).toLocaleDateString()}.`,
        proposal._id.toString()
      );
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
    }
    
    res.json({ success: true, message: 'Deadline updated successfully', deadline });
    
  } catch (error) {
    console.error('Error updating deadline:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark deadline as complete (student or teacher)
router.put('/:proposalId/deadlines/:deadlineId/complete', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const proposal = await Proposal.findById(req.params.proposalId);
    
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }
    
    // Check access
    const isStudent = req.user.role === 'student' && proposal.studentId.toString() === req.user.id;
    const isTeacher = req.user.role === 'teacher' && proposal.assignedSupervisor?.id?.toString() === req.user.id?.toString();
    
    if (!isStudent && !isTeacher) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    if (!proposal.deadlines || proposal.deadlines.length === 0) {
      return res.status(404).json({ success: false, message: 'No deadlines found' });
    }
    
    const deadline = proposal.deadlines.id(req.params.deadlineId);
    if (!deadline) {
      return res.status(404).json({ success: false, message: 'Deadline not found' });
    }
    
    deadline.status = status || 'completed';
    proposal.updatedAt = Date.now();
    await proposal.save();
    
    // Create notification for the other party
    try {
      if (isTeacher) {
        await createNotification(
          proposal.studentId.toString(),
          'student',
          'deadline',
          'Deadline Completed',
          `Teacher ${req.user.name} has marked the deadline for your project "${proposal.projectTitle}" as completed.`,
          proposal._id.toString()
        );
      } else if (isStudent) {
        await createNotification(
          proposal.assignedSupervisor?.id?.toString(),
          'teacher',
          'deadline',
          'Deadline Completed by Student',
          `Student ${proposal.studentName} has marked the deadline for project "${proposal.projectTitle}" as completed.`,
          proposal._id.toString()
        );
      }
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
    }
    
    res.json({ success: true, message: `Deadline marked as ${deadline.status}`, deadline });
    
  } catch (error) {
    console.error('Error updating deadline status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete deadline (teacher only)
router.delete('/:proposalId/deadlines/:deadlineId', authenticateToken, async (req, res) => {
  try {
    console.log('=== DELETE DEADLINE REQUEST ===');
    
    // Check if user is teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ success: false, message: 'Only teachers can delete deadlines' });
    }
    
    const proposal = await Proposal.findById(req.params.proposalId);
    
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }
    
    // Check if teacher is assigned
    if (proposal.assignedSupervisor?.id?.toString() !== req.user.id?.toString()) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this project' });
    }
    
    if (!proposal.deadlines || proposal.deadlines.length === 0) {
      return res.status(404).json({ success: false, message: 'No deadlines found' });
    }
    
    // Get the deadline info before deleting
    const deadlineToDelete = proposal.deadlines.id(req.params.deadlineId);
    if (!deadlineToDelete) {
      return res.status(404).json({ success: false, message: 'Deadline not found' });
    }
    
    const deletedDueDate = deadlineToDelete.dueDate;
    
    // Remove the deadline
    proposal.deadlines = proposal.deadlines.filter(d => d._id.toString() !== req.params.deadlineId);
    proposal.updatedAt = Date.now();
    await proposal.save();
    
    console.log('Deadline deleted successfully');
    
    // Create notification for student about deadline deletion
    try {
      await createNotification(
        proposal.studentId.toString(),
        'student',
        'deadline',
        'Deadline Removed',
        `Teacher ${req.user.name} has removed the deadline for your project "${proposal.projectTitle}" that was due on ${new Date(deletedDueDate).toLocaleDateString()}.`,
        proposal._id.toString()
      );
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
    }
    
    res.json({ success: true, message: 'Deadline deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting deadline:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});





export default router