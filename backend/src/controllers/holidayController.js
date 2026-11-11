import Holiday from '../models/Holiday.js';

/**
 * Seed official 2026 company holidays if collection is empty
 */
export const seedInitialHolidays = async () => {
  try {
    const count = await Holiday.countDocuments();
    if (count === 0) {
      const sampleHolidays = [
        {
          title: "New Year's Day",
          date: new Date('2026-01-01'),
          day: 'Thursday',
          type: 'National',
          description: 'Official federal and company holiday celebrating the new calendar year.',
        },
        {
          title: 'Martin Luther King Jr. Day',
          date: new Date('2026-01-19'),
          day: 'Monday',
          type: 'National',
          description: 'Federal holiday marking the birthday of Dr. Martin Luther King Jr.',
        },
        {
          title: 'Memorial Day',
          date: new Date('2026-05-25'),
          day: 'Monday',
          type: 'National',
          description: 'Honoring and mourning U.S. military personnel.',
        },
        {
          title: 'Independence Day',
          date: new Date('2026-07-04'),
          day: 'Saturday',
          type: 'National',
          description: 'National holiday celebrating the Declaration of Independence.',
        },
        {
          title: 'Labor Day',
          date: new Date('2026-09-07'),
          day: 'Monday',
          type: 'National',
          description: 'Celebrating the social and economic achievements of workers.',
        },
        {
          title: 'Thanksgiving Day',
          date: new Date('2026-11-26'),
          day: 'Thursday',
          type: 'Public',
          description: 'National holiday of harvest celebration and thanksgiving.',
        },
        {
          title: 'Day After Thanksgiving',
          date: new Date('2026-11-27'),
          day: 'Friday',
          type: 'Company',
          description: 'Company-sponsored paid day off following Thanksgiving.',
        },
        {
          title: 'Christmas Eve (Half Day)',
          date: new Date('2026-12-24'),
          day: 'Thursday',
          type: 'Optional',
          description: 'Company half-day preceding Christmas Day.',
        },
        {
          title: 'Christmas Day',
          date: new Date('2026-12-25'),
          day: 'Friday',
          type: 'Public',
          description: 'Official public holiday celebrating Christmas.',
        },
      ];

      await Holiday.insertMany(sampleHolidays);
      console.log('🗓️ Seeded 9 official 2026 holidays into MongoDB');
    }
  } catch (error) {
    console.warn('Holiday seed skipped:', error.message);
  }
};

/**
 * @desc    Get all holidays sorted by date
 * @route   GET /api/holidays
 */
export const getHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });
    res.json({
      success: true,
      count: holidays.length,
      data: holidays,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch holidays',
      error: error.message,
    });
  }
};

/**
 * @desc    Create new holiday (Admin only)
 * @route   POST /api/holidays
 */
export const createHoliday = async (req, res) => {
  try {
    const { title, date, day, type, description } = req.body;

    if (!title || !date) {
      return res.status(400).json({
        success: false,
        message: 'Holiday title and date are required',
      });
    }

    const parsedDate = new Date(date);
    const dayOfWeek = day || parsedDate.toLocaleDateString('en-US', { weekday: 'long' });

    const newHoliday = await Holiday.create({
      title: title.trim(),
      date: parsedDate,
      day: dayOfWeek,
      type: type || 'Public',
      description: description ? description.trim() : '',
    });

    res.status(201).json({
      success: true,
      message: 'Holiday created successfully',
      data: newHoliday,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create holiday',
    });
  }
};

/**
 * @desc    Delete holiday
 * @route   DELETE /api/holidays/:id
 */
export const deleteHoliday = async (req, res) => {
  try {
    const holiday = await Holiday.findById(req.params.id);
    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: 'Holiday not found',
      });
    }

    await Holiday.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Holiday deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete holiday',
      error: error.message,
    });
  }
};

