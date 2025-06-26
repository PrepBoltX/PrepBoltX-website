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

// Create topics for Aptitude (second batch of 5)
const createAptitudeTopics = async () => {
  try {
    const subject = await findAptitudeSubject();
    
    // Second batch of 5 topics with content
    const topicsToCreate = [
      {
        title: "Simple Interest and Compound Interest",
        content: `
# Simple Interest and Compound Interest

## Simple Interest (SI)

Simple interest is calculated only on the initial principal amount. It doesn't take into account the interest that has already been earned.

### Formula

- **Simple Interest (SI) = (P × R × T) / 100**
  - Where:
    - P = Principal (initial amount)
    - R = Rate of interest per annum (in %)
    - T = Time period (in years)

- **Amount = Principal + Simple Interest**
  - A = P + SI = P + (P × R × T) / 100 = P(1 + RT/100)

### Important Properties

1. Simple interest accumulates linearly over time.
2. SI for half the time would be half of the SI for the full time.
3. If rate, time, or principal doubles, the SI also doubles.

## Compound Interest (CI)

Compound interest is calculated on the initial principal and also on the accumulated interest of previous periods. It's essentially "interest on interest."

### Formula

- **Amount = P(1 + R/100)^T**
  - Where:
    - P = Principal (initial amount)
    - R = Rate of interest per annum (in %)
    - T = Time period (in years)

- **Compound Interest = Amount - Principal**
  - CI = P(1 + R/100)^T - P = P[(1 + R/100)^T - 1]

### Compound Interest for Different Time Periods

1. **Annual Compounding:**
   - A = P(1 + R/100)^T

2. **Half-Yearly Compounding:**
   - A = P(1 + R/200)^(2T)

3. **Quarterly Compounding:**
   - A = P(1 + R/400)^(4T)

4. **Monthly Compounding:**
   - A = P(1 + R/1200)^(12T)

### Important Properties

1. Compound interest grows exponentially over time.
2. The longer the time period, the greater the difference between SI and CI.
3. The frequency of compounding affects the final amount; higher frequency leads to more interest.

## Comparing Simple and Compound Interest

- For the same Principal, Rate, and Time, Compound Interest will always be greater than Simple Interest (except for T = 1 year, when they are equal).
- The difference between CI and SI for 2 years = P(R/100)²
- For small values of R and T, we can approximate: CI ≈ SI + P(R/100)²(T)(T-1)/2

## Rate and Time Conversions

- If rate increases by r%, new rate = old rate × (1 + r/100)
- If rate decreases by r%, new rate = old rate × (1 - r/100)
- If time increases by t%, new time = old time × (1 + t/100)
- If time decreases by t%, new time = old time × (1 - t/100)

## Example Problems

1. **Simple Interest:**
   - A sum of $5000 is invested at 8% p.a. simple interest for 3 years. Find the interest earned.
   - SI = (5000 × 8 × 3)/100 = $1200
   - Amount = $5000 + $1200 = $6200

2. **Compound Interest (Annual):**
   - $10,000 is invested at 10% p.a. compounded annually for 2 years. Find the compound interest.
   - A = 10000(1 + 10/100)² = 10000 × 1.1² = 10000 × 1.21 = $12100
   - CI = $12100 - $10000 = $2100

3. **Difference between CI and SI:**
   - For $8000 at 5% p.a. for 2 years:
   - SI = (8000 × 5 × 2)/100 = $800
   - CI = 8000[(1 + 5/100)² - 1] = 8000[1.1025 - 1] = 8000 × 0.1025 = $820
   - Difference = $820 - $800 = $20
`,
        order: 6,
        contentType: 'markdown'
      },
      {
        title: "Mixtures and Alligation",
        content: `
# Mixtures and Alligation

## Basic Concepts

### Mixtures
A mixture is a combination of two or more components. Common examples include mixing liquids (water and milk), metals (gold and copper), or goods with different prices.

### Alligation
Alligation is the rule or method used to solve problems related to mixtures of ingredients at different values, costs, or concentrations.

## Alligation Rule

### Mean Price / Weighted Average
- If a₁, a₂, a₃, ... are quantities with values v₁, v₂, v₃, ... respectively, then:
  - Mean value = (a₁v₁ + a₂v₂ + a₃v₃ + ...) / (a₁ + a₂ + a₃ + ...)

### Alligation Principle (Mixture of Two Components)
- For two components with values v₁ and v₂ mixed to get a mixture with mean value v₃:
  - Ratio of quantities = (v₂ - v₃) : (v₃ - v₁)
  - This is also known as the "Rule of Alligation"

### Alligation Diagram

Component 1 (v₁) ------+
                        |------ Mixture (v₃)
Component 2 (v₂) ------+

- The ratio of Component 1 : Component 2 = (v₂ - v₃) : (v₃ - v₁)

## Applications of Alligation

### Mixing Liquids
1. **Replacing or Replacing and Adding:**
   - When some quantity of a mixture is replaced with another mixture:
   - New concentration = [(Original quantity × Original concentration) ± (Added/Replaced quantity × Added/Replaced concentration)] / Total quantity

2. **Sequential Mixing:**
   - When multiple mixings are done one after another, calculate each step separately.

### Mixing Metals and Alloys
1. **For alloys with different purities:**
   - If metals with purities p₁ and p₂ are mixed in ratio r₁:r₂, then:
   - Purity of the alloy = (r₁p₁ + r₂p₂) / (r₁ + r₂)

### Mixing Goods with Different Prices
1. **Finding the mixing ratio for a target price:**
   - If items with costs c₁ and c₂ are mixed to sell at price c₃, then:
   - Ratio of quantities = (c₂ - c₃) : (c₃ - c₁)

## Special Cases

### Equal Quantities of Components
- If equal quantities of n components with values v₁, v₂, v₃, ... vₙ are mixed:
  - Mean value = (v₁ + v₂ + v₃ + ... + vₙ) / n

### Sliding Mean Method
- When different quantities of the same article at different prices are mixed, the mean price is given by:
  - Mean price = Total cost / Total quantity

## Example Problems

1. **Basic Alligation:**
   - Milk at $5/liter and water at $1/liter are mixed to get a mixture worth $2/liter. In what ratio should they be mixed?
   - Using the Rule of Alligation:
   - Ratio of milk to water = (1 - 2) : (2 - 5) = -1 : -3 = 1 : 3
   - So mix 1 part milk with 3 parts water.

2. **Replacement Problem:**
   - A 40-liter container contains milk and water in the ratio 3:1. If 10 liters of this mixture is replaced with pure water, what is the new ratio of milk to water?
   - Initial milk quantity = 40 × (3/4) = 30 liters
   - Initial water quantity = 40 × (1/4) = 10 liters
   - After replacement: 
     - Milk quantity = 30 - 10 × (3/4) = 30 - 7.5 = 22.5 liters
     - Water quantity = 10 - 10 × (1/4) + 10 = 10 - 2.5 + 10 = 17.5 liters
   - New ratio of milk to water = 22.5 : 17.5 = 9 : 7

3. **Metal Alloy Problem:**
   - Gold with 90% purity and gold with 70% purity are mixed to get gold with 75% purity. In what ratio should they be mixed?
   - Using the Rule of Alligation:
   - Ratio of 90% gold to 70% gold = (70 - 75) : (75 - 90) = -5 : -15 = 1 : 3
   - So mix 1 part of 90% gold with 3 parts of 70% gold.
`,
        order: 7,
        contentType: 'markdown'
      },
      {
        title: "Number Series",
        content: `
# Number Series

## Basic Concepts

Number series are sequences of numbers that follow a specific pattern. Being able to identify these patterns is a crucial skill for aptitude tests.

## Common Types of Number Series

### 1. Arithmetic Progression (AP)

An AP is a sequence where the difference between consecutive terms is constant.

**Formula:**
- General term: aₙ = a + (n-1)d
  - Where a is the first term and d is the common difference
- Sum of n terms: Sₙ = n/2[2a + (n-1)d] = n/2(a + aₙ)

**Example:** 2, 5, 8, 11, 14, ...
- Common difference (d) = 3
- Next term = 14 + 3 = 17

### 2. Geometric Progression (GP)

A GP is a sequence where the ratio of consecutive terms is constant.

**Formula:**
- General term: aₙ = ar^(n-1)
  - Where a is the first term and r is the common ratio
- Sum of n terms: Sₙ = a(1-r^n)/(1-r) for r ≠ 1

**Example:** 3, 6, 12, 24, 48, ...
- Common ratio (r) = 2
- Next term = 48 × 2 = 96

### 3. Harmonic Progression (HP)

An HP is a sequence where the reciprocals of the terms form an AP.

**Formula:**
- If aₙ is an HP, then 1/aₙ is an AP

**Example:** 1, 1/2, 1/3, 1/4, ...
- Taking reciprocals: 1, 2, 3, 4, ... (which is an AP with d = 1)

### 4. Alternating Series

Series where there are alternating patterns between terms or groups of terms.

**Examples:**
- Alternating addition/subtraction: 3, 8, 13, 18, 23, ... (add 5, add 5, ...)
- Alternating operations: 4, 12, 6, 18, 9, ... (multiply by 3, divide by 2, multiply by 3, ...)

### 5. Square/Cube Number Series

Series based on squares, cubes, or other powers of numbers.

**Examples:**
- Squares: 1, 4, 9, 16, 25, ... (1², 2², 3², 4², 5², ...)
- Cubes: 1, 8, 27, 64, 125, ... (1³, 2³, 3³, 4³, 5³, ...)

### 6. Fibonacci Series and Variants

Series where each term is the sum of the previous two terms.

**Examples:**
- Fibonacci: 0, 1, 1, 2, 3, 5, 8, 13, ... (each term is the sum of two previous terms)
- Tribonacci: 0, 0, 1, 1, 2, 4, 7, 13, ... (each term is the sum of three previous terms)

### 7. Mixed Series

Series that combine multiple patterns or involve complex operations.

**Example:** 3, 4, 10, 33, 136, ...
- Differences: 1, 6, 23, 103
- Second differences: 5, 17, 80
- Pattern: Add 1, then multiply by previous term and add 2

## Tips for Solving Number Series

1. **Check for Common Differences:** 
   - Calculate differences between consecutive terms
   - If these differences form another pattern, calculate second differences

2. **Check for Multiplication/Division:**
   - Check if each term is a multiple/divisor of the previous term

3. **Look for Squares, Cubes, and Other Powers:**
   - Check if terms are squares, cubes, or other powers of consecutive integers
   - Or try adding/subtracting squares/cubes to each term

4. **Check for Alternating Patterns:**
   - Look for patterns that alternate between positions (odd/even)

5. **Try Combinations of Operations:**
   - Sometimes a series involves multiple operations
   - E.g., multiply by 2 and add 1

## Example Problems

1. **Find the next term in:** 3, 8, 15, 24, 35, ...
   - Differences: 5, 7, 9, 11
   - Second differences: 2, 2, 2
   - Pattern: Add successive odd numbers (5, 7, 9, 11, 13)
   - Next term = 35 + 13 = 48

2. **Find the missing term in:** 2, 6, 12, ?, 30, 42
   - Check ratios: 6/2 = 3, 12/6 = 2, 30/? = ?, ?/12 = ?, 42/30 = 1.4
   - Check differences: 4, 6, ?, ?, 12
   - Pattern: Add the numbers 4, 6, 8, 10, 12
   - Missing term = 12 + 8 = 20

3. **Find the next term in:** 1, 3, 4, 8, 15, 27, ...
   - This is a mixed series where:
   - Odd positions: 1, 4, 15, ... are Fibonacci numbers squared (1², 2², 5², ...)
   - Even positions: 3, 8, 27, ... are powers of 3 (3¹, 3², 3³)
   - Next term (even position) would be 3⁴ = 81
`,
        order: 8,
        contentType: 'markdown'
      },
      {
        title: "Permutation and Combination",
        content: `
# Permutation and Combination

## Basic Concepts

### Factorial (n!)
- n! = n × (n-1) × (n-2) × ... × 3 × 2 × 1
- 0! = 1 (by definition)
- Examples:
  - 5! = 5 × 4 × 3 × 2 × 1 = 120
  - 4! = 4 × 3 × 2 × 1 = 24

### Fundamental Principle of Counting
- If an event can happen in 'm' ways, and after it happens, a second event can happen in 'n' ways, then the total number of ways the two events can happen is m × n.

## Permutations

A permutation is an arrangement of objects in a specific order.

### Permutation Formula

- **nPr = n!/(n-r)!**
  - Number of ways to arrange r objects from a set of n distinct objects
  - Order matters in permutations

### Special Cases of Permutations

1. **Permutation of n distinct objects taken all at a time:**
   - nPn = n!

2. **Permutation with repetition allowed:**
   - If r objects are selected from n distinct objects, and repetition is allowed:
   - Number of permutations = n^r

3. **Permutation of n objects where some objects are identical:**
   - If among n objects, there are n₁ objects of type 1, n₂ objects of type 2, ..., nₖ objects of type k, and n₁ + n₂ + ... + nₖ = n, then:
   - Number of permutations = n!/(n₁! × n₂! × ... × nₖ!)

4. **Circular Permutations:**
   - Number of ways to arrange n distinct objects in a circle = (n-1)!

## Combinations

A combination is a selection of objects where the order doesn't matter.

### Combination Formula

- **nCr = n!/[r! × (n-r)!]**
  - Number of ways to select r objects from a set of n distinct objects
  - Order doesn't matter in combinations
  - Also written as (n r) or ⁿCᵣ

### Properties of Combinations

1. **nC0 = nCn = 1**
   - There's only one way to select none or all objects

2. **nCr = nC(n-r)**
   - Selecting r objects is the same as not selecting n-r objects

3. **nCr + nC(r-1) = (n+1)Cr**
   - Pascal's Identity (used in Pascal's Triangle)

4. **Sum of all combinations = 2^n**
   - nC0 + nC1 + nC2 + ... + nCn = 2^n

## Permutation vs Combination

- **Permutation:** Order matters
  - Example: Lock combinations (where order matters)
  
- **Combination:** Order doesn't matter
  - Example: Selecting a team (where order doesn't matter)

## Application Problems

### 1. Seating Arrangements

- **Linear Arrangement:** n! ways
- **Circular Arrangement:** (n-1)! ways
- **Around a Rectangular Table:**
  - If sides are distinguished: 4! × (n-4)! ways
  - If only positions matter: n! ways

### 2. Selection Problems

- **Committee Formation:**
  - Selecting r people from n people: nCr ways
  - Selecting with restrictions (e.g., certain people must/must not be included)

### 3. Distribution Problems

- **Distributing n distinct objects among r distinct groups:**
  - Number of ways = r^n
  
- **Distributing n identical objects among r distinct groups:**
  - Number of ways = (n+r-1)C(r-1)

## Example Problems

1. **Permutation Problem:**
   - In how many ways can 5 people be arranged in a row?
   - Answer: 5! = 5 × 4 × 3 × 2 × 1 = 120 ways

2. **Combination Problem:**
   - In how many ways can a committee of 3 people be selected from 8 people?
   - Answer: 8C3 = 8!/(3! × 5!) = (8 × 7 × 6)/(3 × 2 × 1) = 56 ways

3. **Word Formation:**
   - How many different words can be formed from the letters of the word "EQUATION"?
   - The word has 8 letters: E, Q, U, A, T, I, O, N (all distinct)
   - Answer: 8! = 40320 different words

4. **Circular Arrangement:**
   - In how many ways can 6 people be seated around a circular table?
   - Answer: (6-1)! = 5! = 120 ways
`,
        order: 9,
        contentType: 'markdown'
      },
      {
        title: "Probability",
        content: `
# Probability

## Basic Concepts

### Sample Space
- The set of all possible outcomes of an experiment is called the sample space, denoted by S.
- Example: When rolling a die, S = {1, 2, 3, 4, 5, 6}

### Event
- A subset of the sample space is called an event.
- Example: When rolling a die, the event "getting an even number" = {2, 4, 6}

### Probability of an Event
- P(A) = Number of favorable outcomes / Total number of possible outcomes
- 0 ≤ P(A) ≤ 1
- P(S) = 1 (probability of the entire sample space)
- P(∅) = 0 (probability of an impossible event)

## Types of Events

### Mutually Exclusive Events
- Events that cannot occur simultaneously
- If A and B are mutually exclusive: P(A ∩ B) = 0
- Example: Getting a head and a tail in a single coin toss are mutually exclusive

### Exhaustive Events
- A set of events that covers all possible outcomes
- If A₁, A₂, ..., Aₙ are exhaustive: P(A₁ ∪ A₂ ∪ ... ∪ Aₙ) = 1
- Example: Getting a head or a tail in a coin toss are exhaustive events

### Independent Events
- The occurrence of one event does not affect the probability of the other
- If A and B are independent: P(A ∩ B) = P(A) × P(B)
- Example: Drawing cards with replacement results in independent events

### Dependent Events
- The occurrence of one event affects the probability of the other
- If A and B are dependent: P(A ∩ B) = P(A) × P(B|A)
- Example: Drawing cards without replacement results in dependent events

## Laws of Probability

### Addition Law
- For any two events A and B:
  - P(A ∪ B) = P(A) + P(B) - P(A ∩ B)
- For mutually exclusive events:
  - P(A ∪ B) = P(A) + P(B)

### Multiplication Law
- For any two events A and B:
  - P(A ∩ B) = P(A) × P(B|A) = P(B) × P(A|B)
- For independent events:
  - P(A ∩ B) = P(A) × P(B)

### Conditional Probability
- P(B|A) = P(A ∩ B) / P(A)
  - The probability of event B occurring given that event A has occurred

### Bayes' Theorem
- P(A|B) = [P(B|A) × P(A)] / P(B)
  - Used to update the probability of an event based on new evidence

## Probability Distributions

### Binomial Distribution
- For n independent trials with probability p of success in each trial:
  - P(X = r) = ⁿCᵣ × p^r × (1-p)^(n-r)
  - Where X is the number of successes in n trials

### Poisson Distribution
- For rare events:
  - P(X = r) = (e^(-λ) × λ^r) / r!
  - Where λ is the average number of occurrences in the given interval

## Solving Probability Problems

### Using Combinations and Permutations
- For selecting items without replacement:
  - P(specific outcome) = Ways to get the specific outcome / Total number of possible outcomes
  - Often involves nCr calculations

### Complementary Events
- P(A) = 1 - P(not A)
  - Useful when it's easier to calculate the probability of the complement

## Example Problems

1. **Basic Probability:**
   - What is the probability of getting a 6 when rolling a fair die?
   - Answer: P(6) = 1/6

2. **Using Addition Law:**
   - What is the probability of drawing a king or a heart from a standard deck?
   - Kings: 4 cards, Hearts: 13 cards, King of Hearts: 1 card
   - P(King or Heart) = P(King) + P(Heart) - P(King of Heart) = 4/52 + 13/52 - 1/52 = 16/52 = 4/13

3. **Conditional Probability:**
   - Two cards are drawn from a deck without replacement. If the first card is an ace, what is the probability that the second card is also an ace?
   - P(second ace | first ace) = 3/51
     - After drawing the first ace, there are 3 aces left in a deck of 51 cards

4. **Independent Events:**
   - What is the probability of getting two heads when tossing two fair coins?
   - P(HH) = P(H) × P(H) = 1/2 × 1/2 = 1/4

5. **Binomial Probability:**
   - What is the probability of getting exactly 2 heads when tossing a fair coin 5 times?
   - P(X = 2) = ⁵C₂ × (1/2)² × (1/2)³ = 10 × 1/4 × 1/8 = 10/32 = 5/16
`,
        order: 10,
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
    
    console.log(`Created ${createdCount} new Aptitude topics (topics 6-10)`);
  } catch (error) {
    console.error('Error creating Aptitude topics:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the function
createAptitudeTopics(); 