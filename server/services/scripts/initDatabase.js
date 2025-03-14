// server/scripts/initDatabase.js
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATABASE_PATH = path.join(__dirname, '../data/database.json');

// Generate consistent IDs for reference
const CATEGORIES = {
  sciFi: `cat-${uuidv4()}`,
  fantasy: `cat-${uuidv4()}`,
  dystopian: `cat-${uuidv4()}`
};

const PARAMETERS = {
  // Sci-Fi parameters
  techLevel: `param-${uuidv4()}`,
  alienLife: `param-${uuidv4()}`,
  spaceExploration: `param-${uuidv4()}`,
  
  // Fantasy parameters
  magicSystem: `param-${uuidv4()}`,
  creatures: `param-${uuidv4()}`,
  setting: `param-${uuidv4()}`,
  
  // Dystopian parameters
  societyType: `param-${uuidv4()}`,
  survivalDifficulty: `param-${uuidv4()}`,
  hopeLevel: `param-${uuidv4()}`
};

// Create sample database content
const databaseContent = {
  categories: [
    {
      id: CATEGORIES.sciFi,
      name: "Science Fiction",
      visibility: "Show"
    },
    {
      id: CATEGORIES.fantasy,
      name: "Fantasy",
      visibility: "Show"
    },
    {
      id: CATEGORIES.dystopian,
      name: "Dystopian Future",
      visibility: "Show"
    }
  ],
  parameters: [
    // Sci-Fi Parameters
    {
      id: PARAMETERS.techLevel,
      name: "Technology Level",
      type: "Dropdown",
      visibility: "Basic",
      categoryId: CATEGORIES.sciFi,
      values: [
        { id: "tech-1", label: "Near Future" },
        { id: "tech-2", label: "Advanced" },
        { id: "tech-3", label: "Post-Singularity" },
        { id: "tech-4", label: "Ancient Advanced Tech" }
      ],
      config: {}
    },
    {
      id: PARAMETERS.alienLife,
      name: "Alien Life",
      type: "Toggle Switch",
      visibility: "Basic",
      categoryId: CATEGORIES.sciFi,
      values: {
        on: "Yes",
        off: "No"
      },
      config: {}
    },
    {
      id: PARAMETERS.spaceExploration,
      name: "Space Exploration Focus",
      type: "Slider",
      visibility: "Basic",
      categoryId: CATEGORIES.sciFi,
      values: [],
      config: {
        min: 1,
        max: 10,
        step: 1
      }
    },
    
    // Fantasy Parameters
    {
      id: PARAMETERS.magicSystem,
      name: "Magic System",
      type: "Radio Buttons",
      visibility: "Basic",
      categoryId: CATEGORIES.fantasy,
      values: [
        { id: "magic-1", label: "Elemental" },
        { id: "magic-2", label: "Divine" },
        { id: "magic-3", label: "Wild" },
        { id: "magic-4", label: "Forbidden" }
      ],
      config: {}
    },
    {
      id: PARAMETERS.creatures,
      name: "Mythical Creatures",
      type: "Checkbox",
      visibility: "Basic",
      categoryId: CATEGORIES.fantasy,
      values: [
        { id: "creature-1", label: "Dragons" },
        { id: "creature-2", label: "Elves" },
        { id: "creature-3", label: "Dwarves" },
        { id: "creature-4", label: "Unicorns" },
        { id: "creature-5", label: "Merfolk" }
      ],
      config: {}
    },
    {
      id: PARAMETERS.setting,
      name: "Setting",
      type: "Dropdown",
      visibility: "Basic",
      categoryId: CATEGORIES.fantasy,
      values: [
        { id: "setting-1", label: "Medieval Europe" },
        { id: "setting-2", label: "Ancient Orient" },
        { id: "setting-3", label: "Island Realm" },
        { id: "setting-4", label: "Desert Kingdom" }
      ],
      config: {}
    },
    
    // Dystopian Parameters
    {
      id: PARAMETERS.societyType,
      name: "Society Type",
      type: "Dropdown",
      visibility: "Basic",
      categoryId: CATEGORIES.dystopian,
      values: [
        { id: "society-1", label: "Totalitarian Regime" },
        { id: "society-2", label: "Post-Apocalyptic" },
        { id: "society-3", label: "Corporate Controlled" },
        { id: "society-4", label: "Technological Surveillance" }
      ],
      config: {}
    },
    {
      id: PARAMETERS.survivalDifficulty,
      name: "Survival Difficulty",
      type: "Slider",
      visibility: "Basic",
      categoryId: CATEGORIES.dystopian,
      values: [],
      config: {
        min: 1,
        max: 10,
        step: 1
      }
    },
    {
      id: PARAMETERS.hopeLevel,
      name: "Hope Level",
      type: "Slider",
      visibility: "Basic",
      categoryId: CATEGORIES.dystopian,
      values: [],
      config: {
        min: 1,
        max: 10,
        step: 1
      }
    }
  ]
};

// Write sample data to database.json
async function initializeDatabase() {
  try {
    // Make sure the data directory exists
    await fs.ensureDir(path.dirname(DATABASE_PATH));
    
    // Write the data
    await fs.writeJson(DATABASE_PATH, databaseContent, { spaces: 2 });
    
    console.log('Database initialized with sample data!');
    console.log('\nSample Generate Request:');
    console.log(JSON.stringify({
      [CATEGORIES.sciFi]: {
        [PARAMETERS.techLevel]: "Near Future",
        [PARAMETERS.alienLife]: true,
        [PARAMETERS.spaceExploration]: 7
      }
    }, null, 2));
    
    console.log('\nCategory IDs:');
    Object.entries(CATEGORIES).forEach(([name, id]) => {
      console.log(`${name}: ${id}`);
    });
    
    console.log('\nParameter IDs:');
    Object.entries(PARAMETERS).forEach(([name, id]) => {
      console.log(`${name}: ${id}`);
    });
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Run the initialization
initializeDatabase();