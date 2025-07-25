const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const path = require("path");

admin.initializeApp();
const db = admin.firestore();
const tanushree = express();

tanushree.use(cors({origin: true}));
tanushree.use(express.json());

function computeResults(student) {
  const total = student.phy + student.chem + student.math;
  const per = total / 3;
  const grade = per >= 90 ? "A" : per >= 75 ? "B" : per >= 60 ? "C" : "D";
  return {...student, total, per, grade};
}

// ✅ Add student
tanushree.post("/student", async (req, res) => {
  try {
    const data = computeResults(req.body);
    const docRef = db.collection("studentsData").doc(data.email);
    await docRef.set(data);
    res.status(201).send({ message: "Student added", email: data.email });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Error adding student" });
  }
});

// ✅ Get all students
tanushree.get("/students", async (req, res) => {
  try {
    const snapshot = await db.collection("studentsData").get();
    const students = snapshot.docs.map((doc) => doc.data());
    res.send(students);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Error getting students" });
  }
});

// ✅ Get student by email
tanushree.get("/student/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const doc = await db.collection("studentsData").doc(email).get();
    if (!doc.exists) return res.status(404).send({ error: "Student not found" });
    res.send(doc.data());
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Error fetching student" });
  }
});

// ✅ Update student
tanushree.put("/student/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const data = computeResults(req.body);
    await db.collection("studentsData").doc(email).set(data, { merge: true });
    res.send({ message: "Student updated", email });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Error updating student" });
  }
});


// ✅ Delete student
tanushree.delete("/student/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const docRef = db.collection("studentsData").doc(email);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).send({ error: "Student not found" });
    await docRef.delete();
    res.send({ message: "Student deleted", email });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Error deleting student" });
  }
});


// ✅ Register user
tanushree.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).send({ error: "Name, email, and password are required" });
    }

    // Optional: Hash password here before saving to Firestore (for real apps)

    const userDoc = {
      name,
      email,
      password, // In production, store only hashed password!
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Save user by email as doc ID (or use auto ID: db.collection("users").add(userDoc))
    const docRef = db.collection("studentsData").doc(email);
    await docRef.set(userDoc);

    res.status(201).send({ message: "User registered successfully", email });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).send({ error: "Registration failed" });
  }
});


// ✅ Login: Check user auth
tanushree.post("/login", async (req, res) => {
  try {
    const {email, password} = req.body;

    if (!email || !password) {
      return res.status(400).send({error: "Email and password are required"});
    }

    const docRef = db.collection("studentsData").doc(email);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).send({success: false, message: "User not found"});
    }

    const userData = doc.data();

    if (userData.password === password) {
      res.send({success: true, message: "Authentication successful"});
    } else {
      res.send({success: false, message: "Invalid password"});
    }
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).send({success: false, error: "Login failed"});
  }
});

// ✅ Promote to admin
tanushree.put("/make-admin", async (req, res) => {
  const { superEmail, superPassword, email } = req.body;

  if (!superEmail || !superPassword || !email) {
    return res.status(400).json({
      message: "Missing fields",
      error: "Please provide superEmail, superPassword, and target email",
    });
  }

  try {
    // 🔐 Step 1: Authenticate superadmin using document ID (superEmail)
    const superDoc = await db.collection("studentsData").doc(superEmail).get();

    if (!superDoc.exists) {
      return res.status(404).json({
        message: "Superadmin not found",
        error: "No superadmin document found",
      });
    }

    const superData = superDoc.data();

    if (superData.password !== superPassword || superData.Role !== "superadmin") {
      return res.status(403).json({
        message: "Invalid superadmin credentials",
        error: "Password or role mismatch",
      });
    }

    // 👤 Step 2: Find the student to promote
    const studentSnapshot = await db
      .collection("studentsData")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (studentSnapshot.empty) {
      return res.status(404).json({
        message: "Target user not found",
        error: "No user found with the given email",
      });
    }

    const studentDoc = studentSnapshot.docs[0];
    await db.collection("studentsData").doc(studentDoc.id).update({
      Role: "admin",
    });

    return res.status(200).json({
      message: "✅ Student promoted to admin",
    });
  } catch (err) {
    console.error("❌ Error promoting to admin:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
});

// ✅ Demote to student
tanushree.put("/make-student", async (req, res) => {
  const { superEmail, superPassword, email } = req.body;

  if (!superEmail || !superPassword || !email) {
    return res.status(400).json({
      message: "Missing fields",
      error: "Please provide superEmail, superPassword, and target email",
    });
  }

  try {
    // 🔐 Step 1: Authenticate superadmin
    const superDoc = await db.collection("studentsData").doc(superEmail).get();

    if (!superDoc.exists) {
      return res.status(404).json({
        message: "Superadmin not found",
        error: "No superadmin document found",
      });
    }

    const superData = superDoc.data();

    if (superData.password !== superPassword || superData.Role !== "superadmin") {
      return res.status(403).json({
        message: "Invalid superadmin credentials",
        error: "Password or role mismatch",
      });
    }

    // 👤 Step 2: Find the admin to demote
    const studentSnapshot = await db
      .collection("studentsData")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (studentSnapshot.empty) {
      return res.status(404).json({
        message: "Target user not found",
        error: "No user found with the given email",
      });
    }

    const studentDoc = studentSnapshot.docs[0];
    await db.collection("studentsData").doc(studentDoc.id).update({
      Role: "student",
    });

    return res.status(200).json({
      message: "✅ Admin demoted to student",
    });
  } catch (err) {
    console.error("❌ Error demoting to student:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
});

// ✅ Get all registered users (Optional)
tanushree.get("/users", async (req, res) => {
  try {
    const snapshot = await db.collection("usersLogin").get();
    const users = snapshot.docs.map((doc) => doc.data());
    res.send(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).send({error: "Error getting users"});
  }
});

// ✅ Get role of the logged-in user by email
tanushree.get("/role/:email", async (req, res) => {
  try {
    const email = req.params.email;

    if (!email) {
      return res.status(400).send({error: "Email is required"});
    }

    const docRef = db.collection("studentsData").doc(email);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).send({error: "User not found"});
    }

    const userData = doc.data();

    res.send({
      email: email,
      role: userData.Role || "student", // Default to student if role is missing
    });
  } catch (err) {
    console.error("Error fetching role:", err);
    res.status(500).send({error: "Failed to fetch role"});
  }
});

// ✅ Change password route
tanushree.post("/change-password", async (req, res) => {
  try {
    const {email, oldPassword, newPassword} = req.body;

    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({error: "Email, old password, and new password are required"});
    }

    const userDocRef = db.collection("studentsData").doc(email);
    const userSnapshot = await userDocRef.get();

    if (!userSnapshot.exists) {
      return res.status(404).json({error: "User not found"});
    }

    const userData = userSnapshot.data();

    // Check old password
    if (userData.password !== oldPassword) {
      return res.status(401).json({error: "Old password is incorrect"});
    }

    // Update to new password
    await userDocRef.update({
      password: newPassword,
      passwordUpdatedAt: admin.firestore.FieldValue.serverTimestamp(), // optional
    });

    res.status(200).json({message: "Password changed successfully"});
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).json({error: "Failed to change password"});
  }
});

// ✅ Get Admins
tanushree.get("/admins", async (req, res) => {
  try {
    const snapshot = await db
      .collection("studentsData")
      .where("Role", "==", "admin")
      .get();

    if (snapshot.empty) {
      return res.status(404).json({message: "No admins found"});
    }

    const admins = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(admins);
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({error: "Failed to fetch admins"});
  }
});

// ✅ Add a complaint to "complaints" collection
tanushree.post("/complaints", async (req, res) => {
  try {
    const { email, complaint } = req.body;

    if (!email || !complaint) {
      return res.status(400).json({ error: "Email and complaint are required" });
    }

    const docRef = await db.collection("complaints").add({
      email,
      complaint,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ message: "Complaint submitted", id: docRef.id });
  } catch (err) {
    console.error("Error submitting complaint:", err);
    res.status(500).json({ error: "Failed to submit complaint" });
  }
});

// ✅ Get all complaints for a specific user
tanushree.get("/complaints/:email", async (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const snapshot = await db
      .collection("complaints")
      .where("email", "==", email)
      .orderBy("timestamp", "desc")
      .get();

    const complaints = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({ complaints });
  } catch (err) {
    console.error("Error fetching complaints:", err);
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
});

// ✅ Get all problems
tanushree.get("/getallproblems", async (req, res) => {
  try {
    const snapshot = await db.collection("sheets").get();
    const problems = [];

    snapshot.forEach(doc => {
      problems.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json({
      success: true,
      message: "Fetched all problems successfully.",
      data: problems,
    });
  } catch (error) {
    console.error("Error fetching problems:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch problems.",
      error: error.message,
    });
  }
});

// ✅ Get all mcqs
 // GET single MCQ by subject and mcq number
 tanushree.get("/getmcq", async (req, res) => {
  try {
    const { subject, id } = req.query;

    if (!subject || !id) {
      return res.status(400).json({
        success: false,
        message: "Both 'subject' and 'id' are required.",
        example: "/getmcq?subject=java&id=1"
      });
    }

    const mcqNumber = parseInt(id);
    if (isNaN(mcqNumber) || mcqNumber < 1) {
      return res.status(400).json({
        success: false,
        message: "ID must be a valid positive number.",
      });
    }

    const subjectMapping = {
      'c_programming': { code: 'c', baseId: 10000 },
      'c++_programming': { code: 'cpp', baseId: 20000 },
      'java': { code: 'java', baseId: 30000 },
      'python': { code: 'python', baseId: 400000 },
      'pseudo_code': { code: 'pseudo_code', baseId: 90000 }
    };

    const subjectInfo = subjectMapping[subject.toLowerCase()];
    if (!subjectInfo) {
      return res.status(400).json({
        success: false,
        message: `Invalid subject. Choose from: ${Object.keys(subjectMapping).join(', ')}`,
      });
    }

    const actualFieldId = subjectInfo.baseId + (mcqNumber - 1);
    const docId = `${subject.toLowerCase()}_mcq_${actualFieldId}`;

    const docRef = db.collection("my_mcq_details")
                     .doc(subject.toLowerCase())
                     .collection("questions")
                     .doc(docId);

    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: `MCQ not found: ${docId}`
      });
    }

    res.status(200).json({
      success: true,
      message: `MCQ #${mcqNumber} fetched successfully for ${subject}`,
      data: {
        ...doc.data(),
        mcq_number: mcqNumber,
        field_id: actualFieldId,
        document_id: docId,
        subject,
        subject_code: subjectInfo.code
      }
    });
  } catch (error) {
    console.error("❌ Error in /getmcq:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});


// 🎲 Get random MCQ from a subject
tanushree.get("/getrandom", async (req, res) => {
  try {
    const { subject } = req.query;

    if (!subject) {
      return res.status(400).json({
        success: false,
        message: "Subject parameter is required.",
        example: "/getrandom?subject=java"
      });
    }

    const subjectMapping = {
      'c_programming': { baseId: 10000 },
      'c++_programming': { baseId: 20000 },
      'java': { baseId: 30000 },
      'python': { baseId: 400000 },
      'pseudo_code': { baseId: 90000 }
    };

    const subjectInfo = subjectMapping[subject.toLowerCase()];
    if (!subjectInfo) {
      return res.status(400).json({ success: false, message: "Invalid subject." });
    }

    const questionsRef = db.collection("my_mcq_details")
                           .doc(subject.toLowerCase())
                           .collection("questions");

    const snapshot = await questionsRef.get();
    const docs = snapshot.docs;

    if (!docs.length) {
      return res.status(404).json({ success: false, message: "No MCQs found." });
    }

    const randomDoc = docs[Math.floor(Math.random() * docs.length)];
    const fieldId = parseInt(randomDoc.id.split("_").pop());
    const mcqNumber = fieldId - subjectInfo.baseId + 1;

    res.status(200).json({
      success: true,
      message: `Random MCQ for ${subject}`,
      data: {
        ...randomDoc.data(),
        mcq_number: mcqNumber,
        field_id: fieldId,
        document_id: randomDoc.id,
        subject
      },
      total_available: docs.length
    });
  } catch (error) {
    console.error("❌ Error in /getrandom:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});


// 📊 Get MCQ count by subject
tanushree.get("/getmcqcount", async (req, res) => {
  try {
    const { subject } = req.query;

    const subjectList = ['c_programming', 'c++_programming', 'java', 'python', 'pseudo_code'];
    
    if (subject) {
      const doc = await db.collection("my_mcq_details").doc(subject.toLowerCase()).get();
      const count = doc.data()?.totalCount || 0;

      return res.status(200).json({
        success: true,
        subject,
        count
      });
    }

    const subjectCounts = {};
    let total = 0;

    for (const subj of subjectList) {
      try {
        const doc = await db.collection("my_mcq_details").doc(subj).get();
        const count = doc.data()?.totalCount || 0;
        subjectCounts[subj] = count;
        total += count;
      } catch (e) {
        subjectCounts[subj] = 0;
      }
    }

    res.status(200).json({
      success: true,
      message: "MCQ counts by subject",
      data: subjectCounts,
      total
    });
  } catch (error) {
    console.error("❌ Error in /getmcqcount:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

//get notes by subject and unit
 // 🔥 GET /api/subjects
tanushree.get('/api/subjects', async (req, res) => {
  try {
    const snapshot = await db.collection('NotesStudy').listDocuments();
    const subjects = snapshot.map(doc => doc.id);
    res.json({ subjects });
  } catch (err) {
    console.error("🔥 Error fetching subjects:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// 🔥 GET /api/units?subject=adv-java
tanushree.get('/api/units', async (req, res) => {
  const { subject } = req.query;

  console.log('📥 Request received for units with subject:', subject);

  if (!subject) {
    console.log('❌ Missing subject param');
    return res.status(400).json({ error: "Subject is required" });
  }

  try {
    const unitsRef = db.collection('NotesStudy').doc(subject).collection('units');
    const snapshot = await unitsRef.get();

    console.log(`📄 Found ${snapshot.size} unit documents`);

    const units = snapshot.docs.map(doc => {
      const data = doc.data();
      console.log(`➡️ Doc: ${doc.id}, unit: ${data.unit}, heading: ${data.heading}`);
      return {
        heading: data.heading || `Untitled Unit (${data.unit || doc.id})`,
        unit: data.unit || ""
      };
    });

    // Natural-like sorting
    units.sort((a, b) => {
      const toChunks = val => String(val.unit || "").split('.').map(Number);
    
      const A = toChunks(a);
      const B = toChunks(b);
    
      for (let i = 0; i < Math.max(A.length, B.length); i++) {
        if ((A[i] || 0) !== (B[i] || 0)) return (A[i] || 0) - (B[i] || 0);
      }
    
      return (a.heading || "").localeCompare(b.heading);
    });
    

    console.log('✅ Sorted units:', units.map(u => u.unit));

    return res.json({ subject, units });

  } catch (err) {
    console.error("🔥 Error fetching units:", err.message);
    return res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
});

// 🔥 GET /api/notes?subject=adv-java&unit=Layouts
tanushree.get('/api/notes', async (req, res) => {
  const { subject, unit } = req.query;

  if (!subject || !unit) {
    return res.status(400).json({ error: 'subject and unit are required' });
  }

  try {
    const unitsRef = db.collection('NotesStudy')
      .doc(subject)
      .collection('units');

    const snapshot = await unitsRef.get();

    const matchDoc = snapshot.docs.find(doc => {
      const data = doc.data();
      return String(data.unit).trim() === unit.trim();
    });

    if (!matchDoc) {
      return res.status(404).json({
        error: 'Unit not found',
        tried: unit,
        availableUnits: snapshot.docs.map(d => d.data().unit)
      });
    }

    return res.json({
      subject,
      unit: matchDoc.id,
      data: matchDoc.data()
    });

  } catch (err) {
    console.error('🔥 Firestore error:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
});
// edit the notes
tanushree.patch("/notes/:subject/:unit", async (req, res) => {
  const { subject, unit } = req.params;
  const { content, heading, code, unit: newUnit } = req.body;

  const updateData = {};
  if (content !== undefined) updateData.content = content;
  if (heading !== undefined) updateData.heading = heading;
  if (code !== undefined) updateData.code = code;
  if (newUnit !== undefined) updateData.unit = newUnit;

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: "No fields provided to update" });
  }

  try {
    // 🔁 Type-safe comparison
    let unitToMatch = isNaN(unit) ? unit : parseFloat(unit);

    const snapshot = await db
      .collection("NotesStudy")
      .doc(subject)
      .collection("units")
      .where("unit", "==", unitToMatch)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "Note not found for that unit" });
    }

    const docRef = snapshot.docs[0].ref;
    await docRef.update(updateData);

    res.status(200).json({ message: "Note updated successfully" });

  } catch (error) {
    console.error("🔥 Update error:", error);
    res.status(500).json({ error: "Failed to update note" });
  }
});
tanushree.post("/api/ask-ai", async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: "No question provided." });
  }

  try {
    const response = await axios.post(
      "https://api.deepseek.com/v1/chat/completions",
      {
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are a helpful assistant for students." },
          { role: "user", content: question },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${"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"
          }`,
        },
      }
    );

    const aiAnswer = response.data.choices[0].message.content;
    res.json({ answer: aiAnswer });
  } catch (error) {
    console.error("AI error:", error?.response?.data || error.message);
    res.status(500).json({ error: "AI failed to respond." });
  }
});


// ✅ Test route
tanushree.get("/hello", (req, res) => {
  res.send("working");
});

// ✅ Export the Express tanushree as Firebase Function
exports.api = functions.https.onRequest(tanushree);

// I m making a web application using mern stack . in that i am using firestore database instead of mongodb.  