const mongoose = require('mongoose');
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Find the Aptitude subject
const findAptitudeSubject = async () => {
  try {
    const subject = await Subject.findOne({ type: 'Aptitude' });
    if (!subject) {
      console.error('Aptitude subject not found');
      process.exit(1);
    }
    return subject;
  } catch (error) {
    console.error('Error finding Aptitude subject:', error);
    process.exit(1);
  }
};

// Check if topic already exists
const topicExists = async (subjectId, title) => {
  const existingTopic = await Topic.findOne({
    subject: subjectId,
    title: { $regex: new RegExp(`^${title}$`, 'i') }
  });
  return !!existingTopic;
};

// Create topics for Aptitude (first batch of 5)
const createAptitudeTopics = async () => {
  try {
    const subject = await findAptitudeSubject();
    
    // First batch of 5 topics with content
    const topicsToCreate = [
      {
        title: "Percentage",
        content: `
# Percentage

Percentage is a way to express a number as a fraction of 100. It is denoted by the symbol %.

## Basics of Percentage

- A percentage is a dimensionless number (pure number).
- To express a number as a percentage, multiply it by 100.
- To convert a percentage to a decimal, divide it by 100.

### Important Formulas

1. **Percentage Change:**
   - Percent Increase = (Increase ÷ Original Value) × 100%
   - Percent Decrease = (Decrease ÷ Original Value) × 100%

2. **Converting fractions to percentages:**
   - Fraction to percentage: (Numerator ÷ Denominator) × 100%
   - Example: 3/4 = (3 ÷ 4) × 100% = 75%

3. **Compound percentages:**
   - For successive percentage changes (a% followed by b%): 
   - Overall percentage change = (1 + a/100) × (1 + b/100) - 1) × 100%

## Common Applications

1. **Profit and Loss:**
   - Profit percentage = (Profit ÷ Cost Price) × 100%
   - Loss percentage = (Loss ÷ Cost Price) × 100%

2. **Simple Interest:**
   - Simple Interest = (Principal × Rate × Time) ÷ 100

3. **Compound Interest:**
   - Amount = Principal × (1 + Rate/100)^Time
   - Compound Interest = Amount - Principal

## Tips for Solving Percentage Problems

- Remember that percentages are calculated relative to the original amount.
- When dealing with percentage increases or decreases, be careful about what value you're using as the base.
- For consecutive percentage changes, don't simply add or subtract the percentages.

## Example Problems

1. **Basic Conversion:**
   - Express 0.75 as a percentage: 0.75 × 100% = 75%
   - Express 135% as a decimal: 135% ÷ 100 = 1.35

2. **Percentage Change:**
   - If a shirt's price increases from $40 to $50, what is the percentage increase?
   - Percentage increase = ($10 ÷ $40) × 100% = 25%

3. **Profit/Loss:**
   - If an item costs $80 and is sold for $96, what is the profit percentage?
   - Profit = $96 - $80 = $16
   - Profit percentage = ($16 ÷ $80) × 100% = 20%
`,
        order: 1,
        contentType: 'markdown'
      },
      {
        title: "Ratio and Proportion",
        content: `
# Ratio and Proportion

## Ratio

A ratio is a comparison of two or more quantities of the same kind. It shows how many times one quantity contains or is contained in another.

### Key Concepts

- A ratio is expressed as a:b or a/b, where a and b are numbers.
- Ratios are typically expressed in their simplest form (reduced to lowest terms).
- If a:b = c:d, then a/b = c/d.
- If a:b = c:d, then a/c = b/d (alternate ratio).

### Properties of Ratios

1. **Homogeneity:** Quantities in a ratio must have the same unit.
2. **Division Property:** If both terms of a ratio are multiplied or divided by the same non-zero number, the ratio remains unchanged.
3. **Addition Property:** If a:b = c:d, then (a+b):(a-b) = (c+d):(c-d).

## Proportion

A proportion is an equality of two ratios. If a:b = c:d, we say that a, b, c, and d are in proportion.

### Key Concepts

- In a proportion a:b = c:d, a and d are called extremes (outer terms), while b and c are called means (inner terms).
- In any proportion, the product of extremes equals the product of means: a×d = b×c.

### Types of Proportion

1. **Direct Proportion:** When one quantity increases, the other also increases in the same ratio.
   - If x ∝ y, then x = ky, where k is the constant of proportionality.

2. **Inverse Proportion:** When one quantity increases, the other decreases in the same ratio.
   - If x ∝ 1/y, then xy = k, where k is the constant of proportionality.

3. **Compound Proportion:** When a quantity varies directly or inversely with two or more other quantities.

## Applications

1. **Dividing in a Given Ratio:**
   - To divide a quantity in the ratio a:b:c..., find the sum of ratio terms (a+b+c+...) and divide the quantity by this sum to get the value of one part.

2. **Time and Work Problems:**
   - If A can do a work in x days and B can do the same work in y days, then their ratio of work done in one day is y:x.

3. **Mixtures and Alloys:**
   - When two quantities are mixed in the ratio a:b, then:
   - Ratio of first quantity to the mixture = a:(a+b)
   - Ratio of second quantity to the mixture = b:(a+b)

## Example Problems

1. **Simplifying Ratios:**
   - Express 15:25 in its simplest form.
   - GCD of 15 and 25 is 5
   - So 15:25 = 3:5

2. **Dividing in a Ratio:**
   - Divide $800 in the ratio 3:5.
   - Total parts = 3+5 = 8
   - First share = (3/8) × $800 = $300
   - Second share = (5/8) × $800 = $500

3. **Proportion Problem:**
   - If 8 workers can build a wall in 10 days, how many days will it take 5 workers to build the same wall?
   - Work ∝ Number of workers × Number of days
   - 8 × 10 = 5 × x
   - x = (8 × 10)/5 = 16 days
`,
        order: 2,
        contentType: 'markdown'
      },
      {
        title: "Time and Work",
        content: `
# Time and Work

## Basic Concepts

Time and Work problems relate to the time taken by individuals or machines to complete a task and how combining their efforts affects the total time required.

### Key Formulas

1. **Work Rate:** The rate at which work is done = 1/Time taken to complete the work
   - If A can complete a task in 'n' days, A's work rate = 1/n per day

2. **Combined Work Rate:** When multiple people/machines work together, their work rates add up
   - If A's rate = 1/a and B's rate = 1/b, their combined rate = (1/a) + (1/b) = (a+b)/(a×b)

3. **Time to Complete Work Together:**
   - Time = 1/Combined work rate
   - Time = (a×b)/(a+b) where a and b are individual times

## Work Efficiency

- **Efficiency Ratio:** If A and B can complete a work in 'a' and 'b' days respectively, their efficiency ratio is b:a
- **Work Done Ratio:** When A and B work together, the ratio of work done by them is 1/a : 1/b = b:a

## Special Cases

1. **Pipes and Cisterns:**
   - Inlet pipes: Fill a tank in 'x' time, work rate = 1/x
   - Outlet pipes: Empty a tank in 'y' time, work rate = -1/y (negative as it removes)
   - Combined effect = Sum of all work rates

2. **Work and Wages:**
   - If wages are proportional to work done, they are also proportional to time spent (for same rate of work)
   - If wages are proportional to efficiency, they are inversely proportional to the time taken

3. **Work in Shifts:**
   - Calculate work done in each shift separately, then sum up

## Tips for Solving Problems

- Always convert the problem to work rates (1/time) to make calculations easier
- Remember that work rate is additive when people work together
- For problems involving pipes filling or emptying a tank, use positive rates for filling and negative rates for emptying
- Pay attention to whether the entire work is done or only a fraction of it

## Example Problems

1. **Basic Time and Work:**
   - If A can do a work in 12 days and B in 15 days, how long will they take to complete it working together?
   - A's work rate = 1/12 per day
   - B's work rate = 1/15 per day
   - Combined work rate = 1/12 + 1/15 = (15+12)/(12×15) = 27/180 = 3/20
   - Time taken together = 1/(3/20) = 20/3 = 6⅔ days

2. **Pipe and Cistern:**
   - An inlet pipe can fill a tank in 10 hours. An outlet pipe can empty it in 15 hours. If both pipes are open, how long will it take to fill the tank?
   - Inlet pipe's rate = +1/10 (fills the tank)
   - Outlet pipe's rate = -1/15 (empties the tank)
   - Net rate = 1/10 - 1/15 = 3/30 - 2/30 = 1/30
   - Time to fill = 1/(1/30) = 30 hours

3. **Partial Work:**
   - A can do a piece of work in 10 days and B can do it in 15 days. They worked together for 3 days. What fraction of the work remains?
   - Work done in 1 day by both = 1/10 + 1/15 = 3/30 + 2/30 = 5/30 = 1/6
   - Work done in 3 days = 3 × 1/6 = 1/2
   - Work remaining = 1 - 1/2 = 1/2
`,
        order: 3,
        contentType: 'markdown'
      },
      {
        title: "Time, Speed and Distance",
        content: `
# Time, Speed and Distance

## Basic Concepts and Formulas

The relationship between time, speed, and distance is fundamental to many aptitude problems. These concepts are interconnected through the following basic formula:

### Key Formula
- **Speed = Distance / Time**
- **Time = Distance / Speed**
- **Distance = Speed × Time**

## Units of Measurement

- **Speed**: km/h (kilometers per hour), m/s (meters per second), mph (miles per hour)
- **Distance**: km (kilometers), m (meters), miles, etc.
- **Time**: hours, minutes, seconds

### Conversion Factors
- 1 km/h = 5/18 m/s
- 1 m/s = 18/5 km/h ≈ 3.6 km/h
- 1 hour = 60 minutes = 3600 seconds

## Relative Speed

1. **When two objects move in the same direction:**
   - Relative Speed = |Speed of A - Speed of B|

2. **When two objects move in opposite directions:**
   - Relative Speed = Speed of A + Speed of B

## Average Speed

- **Average Speed = Total Distance / Total Time**
- Note: When traveling at different speeds for equal distances, the average speed is the harmonic mean:
  - Average Speed = 2ab/(a+b) when traveling equal distances at speeds a and b

## Time to Meet and Time to Overtake

1. **Meeting Time (objects moving towards each other):**
   - Time = Distance between them / Relative Speed

2. **Overtaking Time (objects moving in same direction):**
   - Time = Distance between them / Relative Speed

## Circular Motion

- For an object moving in a circular path:
  - Distance covered in one complete revolution = Circumference = 2πr
  - Time for one revolution = Circumference / Speed

## Boats and Streams

1. **Downstream Speed = Speed of boat in still water + Speed of stream**
2. **Upstream Speed = Speed of boat in still water - Speed of stream**

If downstream speed = a and upstream speed = b, then:
- Speed of boat in still water = (a+b)/2
- Speed of stream = (a-b)/2

## Trains

1. **Time taken by a train of length L to cross an object:**
   - Time = Length of train / Speed of train

2. **Time taken by a train of length L to cross a platform of length P:**
   - Time = (Length of train + Length of platform) / Speed of train

## Example Problems

1. **Basic Speed Problem:**
   - A car travels 240 km in 3 hours. What is its speed?
   - Speed = Distance / Time = 240 km / 3 h = 80 km/h

2. **Average Speed:**
   - A person travels 30 km at 60 km/h and then another 30 km at 40 km/h. What is the average speed?
   - Total distance = 30 + 30 = 60 km
   - Time for first 30 km = 30/60 = 0.5 hours
   - Time for next 30 km = 30/40 = 0.75 hours
   - Total time = 1.25 hours
   - Average speed = 60/1.25 = 48 km/h

3. **Trains Crossing:**
   - Two trains of lengths 100m and 150m are moving in opposite directions at speeds of 36 km/h and 54 km/h. How long will they take to completely pass each other?
   - Combined length = 100 + 150 = 250 m = 0.25 km
   - Relative speed = 36 + 54 = 90 km/h
   - Time = Distance / Speed = 0.25 / 90 = 0.00277... hours = 10 seconds
`,
        order: 4,
        contentType: 'markdown'
      },
      {
        title: "Profit, Loss and Discount",
        content: `
# Profit, Loss and Discount

## Basic Concepts

### Cost Price (CP)
The price at which an article is purchased is called the cost price.

### Selling Price (SP)
The price at which an article is sold is called the selling price.

### Profit
When SP > CP, the seller makes a profit.
- Profit = SP - CP
- Profit Percentage = (Profit / CP) × 100%

### Loss
When SP < CP, the seller incurs a loss.
- Loss = CP - SP
- Loss Percentage = (Loss / CP) × 100%

## Marking Price and Discount

### Marked Price (MP)
The price marked on an article is called the marked price or list price.

### Discount
The reduction given on the marked price is called discount.
- Discount = MP - SP
- Discount Percentage = (Discount / MP) × 100%

### Selling Price after Discount
- SP = MP - Discount
- SP = MP × (1 - Discount% / 100)

## Successive Discounts

When multiple discounts are offered successively:
- If discounts are a%, b%, then the effective discount = a + b - (ab/100)%
- For example, two successive discounts of 20% and 10%:
  - Effective discount = 20 + 10 - (20×10/100) = 28%
- For three successive discounts a%, b%, and c%:
  - Effective discount = [1 - (1-a/100)(1-b/100)(1-c/100)] × 100%

## Cost Price and Selling Price Relationships

1. **To find SP when CP and profit% are given:**
   - SP = CP × (1 + profit% / 100)

2. **To find SP when CP and loss% are given:**
   - SP = CP × (1 - loss% / 100)

3. **To find CP when SP and profit% are given:**
   - CP = SP / (1 + profit% / 100)

4. **To find CP when SP and loss% are given:**
   - CP = SP / (1 - loss% / 100)

## Special Cases

### Selling at Cost Price (No Profit No Loss)
When an article is sold at its cost price, there is neither profit nor loss.
- SP = CP

### Break-even Point
The point where total cost equals total revenue (no profit, no loss).

## Important Formulas

1. **If an article is sold at a profit of p%:**
   - SP = CP × (100 + p) / 100

2. **If an article is sold at a loss of l%:**
   - SP = CP × (100 - l) / 100

3. **If an article is marked up by m% and a discount of d% is offered:**
   - SP = CP × (100 + m) / 100 × (100 - d) / 100

4. **When an article is sold at the same SP but one at profit p% and another at loss p%:**
   - Ratio of CPs = 10000 - p² : 10000 + p²

## Example Problems

1. **Basic Profit/Loss:**
   - An article is bought for $800 and sold for $1000. Find the profit percentage.
   - Profit = SP - CP = $1000 - $800 = $200
   - Profit Percentage = (Profit / CP) × 100% = (200 / 800) × 100% = 25%

2. **Discount Problem:**
   - A shopkeeper marks his goods at 30% above the cost price and gives a discount of 10%. Find his profit percentage.
   - Marked Price = CP × 1.30
   - SP = MP × 0.90 = CP × 1.30 × 0.90 = CP × 1.17
   - Profit Percentage = (SP - CP) / CP × 100% = (1.17CP - CP) / CP × 100% = 17%

3. **Successive Discounts:**
   - A product is marked at $500 and sold after successive discounts of 20% and 10%. Find the SP and the effective discount.
   - SP = $500 × (1 - 20/100) × (1 - 10/100) = $500 × 0.8 × 0.9 = $360
   - Effective Discount = $500 - $360 = $140
   - Effective Discount Percentage = (140 / 500) × 100% = 28%
`,
        order: 5,
        contentType: 'markdown'
      }
    ];

    // Process each topic
    let createdCount = 0;
    for (const topicData of topicsToCreate) {
      // Check if topic already exists
      const exists = await topicExists(subject._id, topicData.title);
      if (exists) {
        console.log(`Topic "${topicData.title}" already exists, skipping...`);
        continue;
      }

      // Create new topic
      const topic = new Topic({
        ...topicData,
        subject: subject._id,
      });

      await topic.save();

      // Update subject with new topic
      subject.topics.push(topic._id);
      subject.totalTopics += 1;
      
      console.log(`Created topic: ${topicData.title}`);
      createdCount++;
    }
    
    // Save the subject with updated topics
    await subject.save();
    
    console.log(`Created ${createdCount} new Aptitude topics`);
  } catch (error) {
    console.error('Error creating Aptitude topics:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the function
createAptitudeTopics(); 