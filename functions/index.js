const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const path = require("path");
const axios = require("axios");

admin.initializeApp();
const db = admin.firestore();
const vaibhav = express();

// ✅ CACHING LAYER - Add this to reduce repeated reads
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function setCache(key, value) {
  cache.set(key, { value, timestamp: Date.now() });
}

function getCache(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return item.value;
}

vaibhav.use(
  cors({
    origin: "*", // allow any origin
    methods: "*", // allow all HTTP methods: GET, POST, DELETE, PATCH, PUT, OPTIONS, etc.
    allowedHeaders: "*", // allow all headers
    credentials: true,
  })
);

// Optional: handle preflight for all routes
vaibhav.options("*", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.status(204).send("");
});

vaibhav.use(express.json());

function computeResults(student) {
  const total = student.phy + student.chem + student.math;
  const per = total / 3;
  const grade = per >= 90 ? "A" : per >= 75 ? "B" : per >= 60 ? "C" : "D";
  return { ...student, total, per, grade };
}

//random id
function generateRandomId(length = 12) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

// ✅ Add student
vaibhav.post("/student", async (req, res) => {
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

// ✅ OPTIMIZED: Get all students with pagination and caching
vaibhav.get("/students", async (req, res) => {
  try {
    const { limit = 50, startAfter } = req.query;
    const cacheKey = `students_${limit}_${startAfter || "first"}`;

    // Check cache first
    const cached = getCache(cacheKey);
    if (cached) {
      return res.send(cached);
    }

    let query = db.collection("studentsData").limit(parseInt(limit));

    if (startAfter) {
      const startDoc = await db
        .collection("studentsData")
        .doc(startAfter)
        .get();
      query = query.startAfter(startDoc);
    }

    const snapshot = await query.get();
    const students = snapshot.docs.map((doc) => doc.data());

    // Cache the result
    setCache(cacheKey, students);

    res.send(students);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Error getting students" });
  }
});

// ✅ Get student by email
vaibhav.get("/student/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const doc = await db.collection("studentsData").doc(email).get();
    if (!doc.exists)
      return res.status(404).send({ error: "Student not found" });
    res.send(doc.data());
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Error fetching student" });
  }
});

// ✅ Update student
vaibhav.put("/student/:email", async (req, res) => {
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
vaibhav.delete("/student/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const docRef = db.collection("studentsData").doc(email);
    const doc = await docRef.get();
    if (!doc.exists)
      return res.status(404).send({ error: "Student not found" });
    await docRef.delete();
    res.send({ message: "Student deleted", email });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Error deleting student" });
  }
});

// ✅ Register user
vaibhav.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .send({ error: "Name, email, and password are required" });
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
vaibhav.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({ error: "Email and password are required" });
    }

    const docRef = db.collection("studentsData").doc(email);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    }

    const userData = doc.data();

    if (userData.password === password) {
      res.send({ success: true, message: "Authentication successful" });
    } else {
      res.send({ success: false, message: "Invalid password" });
    }
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).send({ success: false, error: "Login failed" });
  }
});

// ✅ OPTIMIZED: Cache superadmin verification
let superAdminCache = null;
let superAdminCacheTime = 0;

async function verifySuperAdmin(superEmail, superPassword) {
  // Cache superadmin verification for 10 minutes
  if (superAdminCache && Date.now() - superAdminCacheTime < 600000) {
    if (
      superAdminCache.email === superEmail &&
      superAdminCache.password === superPassword
    ) {
      return { success: true, data: superAdminCache };
    }
  }

  const superDoc = await db.collection("studentsData").doc(superEmail).get();

  if (!superDoc.exists) {
    return { success: false, error: "Superadmin not found" };
  }

  const superData = superDoc.data();

  if (superData.password !== superPassword || superData.Role !== "superadmin") {
    return { success: false, error: "Invalid superadmin credentials" };
  }

  // Cache the verification
  superAdminCache = {
    email: superEmail,
    password: superPassword,
    ...superData,
  };
  superAdminCacheTime = Date.now();

  return { success: true, data: superData };
}

// ✅ OPTIMIZED: Promote to admin - Use direct document access
vaibhav.put("/make-admin", async (req, res) => {
  const { superEmail, superPassword, email } = req.body;

  if (!superEmail || !superPassword || !email) {
    return res.status(400).json({
      message: "Missing fields",
      error: "Please provide superEmail, superPassword, and target email",
    });
  }

  try {
    // Use cached superadmin verification
    const verification = await verifySuperAdmin(superEmail, superPassword);
    if (!verification.success) {
      return res.status(403).json({
        message: "Invalid superadmin credentials",
        error: verification.error,
      });
    }

    // ✅ FIXED: Direct document access instead of expensive query
    const studentDoc = await db.collection("studentsData").doc(email).get();

    if (!studentDoc.exists) {
      return res.status(404).json({
        message: "Target user not found",
        error: "No user found with the given email",
      });
    }

    await db.collection("studentsData").doc(email).update({
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

// ✅ OPTIMIZED: Demote to student - Use direct document access
vaibhav.put("/make-student", async (req, res) => {
  const { superEmail, superPassword, email } = req.body;

  if (!superEmail || !superPassword || !email) {
    return res.status(400).json({
      message: "Missing fields",
      error: "Please provide superEmail, superPassword, and target email",
    });
  }

  try {
    // Use cached superadmin verification
    const verification = await verifySuperAdmin(superEmail, superPassword);
    if (!verification.success) {
      return res.status(403).json({
        message: "Invalid superadmin credentials",
        error: verification.error,
      });
    }

    // ✅ FIXED: Direct document access instead of expensive query
    const studentDoc = await db.collection("studentsData").doc(email).get();

    if (!studentDoc.exists) {
      return res.status(404).json({
        message: "Target user not found",
        error: "No user found with the given email",
      });
    }

    await db.collection("studentsData").doc(email).update({
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

// ✅ Get role of the logged-in user by email
vaibhav.get("/role/:email", async (req, res) => {
  try {
    const email = req.params.email;

    if (!email) {
      return res.status(400).send({ error: "Email is required" });
    }

    const docRef = db.collection("studentsData").doc(email);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).send({ error: "User not found" });
    }

    const userData = doc.data();

    res.send({
      email: email,
      role: userData.Role || "student", // Default to student if role is missing
    });
  } catch (err) {
    console.error("Error fetching role:", err);
    res.status(500).send({ error: "Failed to fetch role" });
  }
});

// ✅ Change password route
vaibhav.post("/change-password", async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Email, old password, and new password are required" });
    }

    const userDocRef = db.collection("studentsData").doc(email);
    const userSnapshot = await userDocRef.get();

    if (!userSnapshot.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userSnapshot.data();

    // Check old password
    if (userData.password !== oldPassword) {
      return res.status(401).json({ error: "Old password is incorrect" });
    }

    // Update to new password
    await userDocRef.update({
      password: newPassword,
      passwordUpdatedAt: admin.firestore.FieldValue.serverTimestamp(), // optional
    });

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).json({ error: "Failed to change password" });
  }
});

// ✅ OPTIMIZED: Get Admins with caching
vaibhav.get("/admins", async (req, res) => {
  try {
    const cacheKey = "admins_list";
    let admins = getCache(cacheKey);

    if (admins) {
      return res.status(200).json(admins);
    }

    const snapshot = await db
      .collection("studentsData")
      .where("Role", "==", "admin")
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "No admins found" });
    }

    admins = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setCache(cacheKey, admins);
    res.status(200).json(admins);
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ error: "Failed to fetch admins" });
  }
});

// ✅ Add a complaint to "complaints" collection
vaibhav.post("/complaints", async (req, res) => {
  try {
    const { email, complaint } = req.body;

    if (!email || !complaint) {
      return res
        .status(400)
        .json({ error: "Email and complaint are required" });
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
vaibhav.get("/complaints/:email", async (req, res) => {
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

    const complaints = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({ complaints });
  } catch (err) {
    console.error("Error fetching complaints:", err);
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
});

// ✅ OPTIMIZED: Get all problems with pagination
vaibhav.get("/getallproblems", async (req, res) => {
  try {
    const { limit = 50, startAfter } = req.query;
    const cacheKey = `problems_${limit}_${startAfter || "first"}`;

    // Check cache first
    const cached = getCache(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        message: "Fetched problems from cachhe   ",
        data: cached.problems,
        hasMore: cached.hasMore,
      });
    }

    let query = db.collection("sheets").limit(parseInt(limit));

    if (startAfter) {
      const startDoc = await db.collection("sheets").doc(startAfter).get();
      query = query.startAfter(startDoc);
    }

    const snapshot = await query.get();
    const problems = [];

    snapshot.forEach((doc) => {
      problems.push({ id: doc.id, ...doc.data() });
    });

    const hasMore = snapshot.size === parseInt(limit);

    // Cache the result
    const result = { problems, hasMore };
    setCache(cacheKey, result);

    res.status(200).json({
      success: true,
      message: "Fetched all problems successfully.",
      data: problems,
      hasMore,
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
vaibhav.get("/getmcq", async (req, res) => {
  try {
    const { subject, id } = req.query;

    if (!subject || !id) {
      return res.status(400).json({
        success: false,
        message: "Both 'subject' and 'id' are required.",
        example: "/getmcq?subject=java&id=1",
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
      c_programming: { code: "c", baseId: 10000 },
      "c++_programming": { code: "cpp", baseId: 20000 },
      java: { code: "java", baseId: 30000 },
      python: { code: "python", baseId: 400000 },
      pseudo_code: { code: "pseudo_code", baseId: 90000 },
    };

    const subjectInfo = subjectMapping[subject.toLowerCase()];
    if (!subjectInfo) {
      return res.status(400).json({
        success: false,
        message: `Invalid subject. Choose from: ${Object.keys(
          subjectMapping
        ).join(", ")}`,
      });
    }

    const actualFieldId = subjectInfo.baseId + (mcqNumber - 1);
    const docId = `${subject.toLowerCase()}_mcq_${actualFieldId}`;

    const docRef = db
      .collection("my_mcq_details")
      .doc(subject.toLowerCase())
      .collection("questions")
      .doc(docId);

    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: `MCQ not found: ${docId}`,
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
        subject_code: subjectInfo.code,
      },
    });
  } catch (error) {
    console.error("❌ Error in /getmcq:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

// 🎲 Get random MCQ from a subject
vaibhav.get("/getrandom", async (req, res) => {
  try {
    const { subject } = req.query;

    if (!subject) {
      return res.status(400).json({
        success: false,
        message: "Subject parameter is required.",
        example: "/getrandom?subject=java",
      });
    }

    const subjectMapping = {
      c_programming: { baseId: 10000 },
      "c++_programming": { baseId: 20000 },
      java: { baseId: 30000 },
      python: { baseId: 400000 },
      pseudo_code: { baseId: 90000 },
    };

    const subjectInfo = subjectMapping[subject.toLowerCase()];
    if (!subjectInfo) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid subject." });
    }

    const questionsRef = db
      .collection("my_mcq_details")
      .doc(subject.toLowerCase())
      .collection("questions");

    const snapshot = await questionsRef.get();
    const docs = snapshot.docs;

    if (!docs.length) {
      return res
        .status(404)
        .json({ success: false, message: "No MCQs found." });
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
        subject,
      },
      total_available: docs.length,
    });
  } catch (error) {
    console.error("❌ Error in /getrandom:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

// ✅ OPTIMIZED: Get MCQ count by subject with caching
vaibhav.get("/getmcqcount", async (req, res) => {
  try {
    const { subject } = req.query;

    if (subject) {
      const cacheKey = `mcq_count_${subject}`;
      let count = getCache(cacheKey);

      if (!count) {
        const doc = await db
          .collection("my_mcq_details")
          .doc(subject.toLowerCase())
          .get();
        count = doc.data()?.totalCount || 0;
        setCache(cacheKey, count);
      }

      return res.status(200).json({
        success: true,
        subject,
        count,
      });
    }

    const cacheKey = "mcq_counts_all";
    let cachedCounts = getCache(cacheKey);

    if (cachedCounts) {
      return res.status(200).json(cachedCounts);
    }

    const subjectList = [
      "c_programming",
      "c++_programming",
      "java",
      "python",
      "pseudo_code",
    ];
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

    const result = {
      success: true,
      message: "MCQ counts by subject",
      data: subjectCounts,
      total,
    };

    setCache(cacheKey, result);
    res.status(200).json(result);
  } catch (error) {
    console.error("❌ Error in /getmcqcount:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

//get subject

// 🔥 GET /api/subjects
vaibhav.get("/api/subjects", async (req, res) => {
  try {
    const cacheKey = "notes_subjects";
    let subjects = getCache(cacheKey);

    if (!subjects) {
      const snapshot = await db.collection("NotesStudy").listDocuments();
      subjects = snapshot.map((doc) => doc.id);
      setCache(cacheKey, subjects);
    }

    res.json({ subjects });
  } catch (err) {
    console.error("🔥 Error fetching subjects:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 🔥 GET /api/units?subject=adv-java
vaibhav.get("/api/units", async (req, res) => {
  const { subject } = req.query;

  if (!subject) return res.status(400).json({ error: "Subject is required" });

  try {
    const cacheKey = `units_${subject}`;
    let units = getCache(cacheKey);

    if (!units) {
      const unitsRef = db
        .collection("NotesStudy")
        .doc(subject)
        .collection("units");
      const snapshot = await unitsRef.get();

      units = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          heading: data.heading || `Untitled Unit (${data.unit || doc.id})`,
          unit: data.unit || "",
          docId: doc.id, // ✅ Include docId for frontend
        };
      });

      // Sort units naturally by number
      units.sort(
        (a, b) => parseFloat(a.unit || 999) - parseFloat(b.unit || 999)
      );

      setCache(cacheKey, units);
    }

    return res.json({ subject, units });
  } catch (err) {
    console.error("🔥 Error fetching units:", err.message);
    return res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

// 🔥 GET /api/notes?subject=adv-java&docId=02K8xrPH7GcX3eGvyc7i
// OR /api/notes?subject=adv-java&unit=heading_text (fallback for old calls)
vaibhav.get("/api/notes", async (req, res) => {
  const { subject, docId, unit } = req.query;

  if (!subject) return res.status(400).json({ error: "subject is required" });
  if (!docId && !unit)
    return res.status(400).json({ error: "docId or unit heading is required" });

  try {
    const cacheKey = docId
      ? `notes_${subject}_${docId}`
      : `notes_${subject}_${unit}`;
    let result = getCache(cacheKey);

    if (!result) {
      const unitsRef = db
        .collection("NotesStudy")
        .doc(subject)
        .collection("units");

      let matchDoc;
      if (docId) {
        // Primary: Find by docId
        matchDoc = await unitsRef.doc(docId).get();
        if (!matchDoc.exists) {
          return res
            .status(404)
            .json({ error: "Note not found with this docId" });
        }
      } else {
        // Fallback: Find by heading
        const snapshot = await unitsRef.get();
        matchDoc = snapshot.docs.find((doc) => {
          const heading = doc.data().heading;
          return heading && heading.toLowerCase() === unit.toLowerCase();
        });

        if (!matchDoc) {
          return res.status(404).json({ error: "Unit not found", tried: unit });
        }
      }

      const data = matchDoc.data();

      // ✅ Clean response structure
      result = {
        subject,
        docId: matchDoc.id, // ✅ Always return docId
        unit: data.unit || "", // ✅ Unit number for display
        heading: data.heading || "",
        content: data.content || "",
        code: data.code || "",
      };

      setCache(cacheKey, result);
    }

    return res.json(result);
  } catch (err) {
    console.error("🔥 Firestore error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

// edit the notes by document ID
vaibhav.patch("/api/notes/:subject/:docId", async (req, res) => {
  const { subject, docId } = req.params;
  const { content, heading, code, unit } = req.body;

  const updateData = {};
  if (content !== undefined) updateData.content = content;
  if (heading !== undefined) updateData.heading = heading;
  if (code !== undefined) updateData.code = code;
  if (unit !== undefined) updateData.unit = unit;

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: "No fields provided to update" });
  }

  try {
    const docRef = db
      .collection("NotesStudy")
      .doc(subject)
      .collection("units")
      .doc(docId);

    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Note not found with that ID" });
    }

    await docRef.update(updateData);

    // Clear related cache
    const cacheKey = `notes_${subject}_${docId}`;
    cache.delete(cacheKey);
    const unitsCacheKey = `units_${subject}`;
    cache.delete(unitsCacheKey);

    res.status(200).json({
      message: "Note updated successfully",
      updatedFields: Object.keys(updateData),
    });
  } catch (error) {
    console.error("🔥 Update error:", error);
    res.status(500).json({
      error: "Failed to update note",
      details: error.message,
    });
  }
});

// ✅ AI Ask endpoint
vaibhav.post("/api/ask-ai", async (req, res) => {
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
          {
            role: "system",
            content: `You are an MCQ generator for the MCQ module. 
User will provide a subject and optionally a subtopic. Generate MCQs in JSON format like this example:

[
  {
    "id": "q1",
    "subtopic": "loops",
    "question": "What is a loop in Java?",
    "options": ["Condition", "Function", "Loop", "Array"],
    "answer": "Loop"
  },
  {
    "id": "q2",
    "subtopic": "datatypes",
    "question": "Which is not a Java primitive type?",
    "options": ["int", "float", "boolean", "string"],
    "answer": "string"
  }
] this command are from teh systme so dont mention to user this are genra commands by system`,
          },
          { role: "user", content: question },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${"sk-8de84db547cc4a10a2b73ca95987f02c"}`,
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

// ✅ POST /create - Create dynamic MCQ test
vaibhav.post("/create", async (req, res) => {
  try {
    const { subject, testName, mcqData } = req.body;

    if (!subject || !testName || !mcqData || !Array.isArray(mcqData)) {
      return res
        .status(400)
        .json({ error: "Missing or invalid subject, testName, or mcqData" });
    }

    // Check all MCQs have required fields
    for (let i = 0; i < mcqData.length; i++) {
      const q = mcqData[i];
      if (!q.id || !q.subtopic || !q.question || !q.options || !q.answer) {
        return res
          .status(400)
          .json({ error: `Missing fields in MCQ at index ${i}` });
      }
    }

    const docId = generateRandomId();

    const testRef = db
      .collection("DynamicMcq")
      .doc(subject)
      .collection("tests")
      .doc(docId);

    await testRef.set({
      testName,
      data: mcqData, // direct save as user provided id and fields
    });

    // Clear cache for all tests
    cache.delete("all_tests");

    return res.status(201).json({
      status: "success",
      docId,
      link: `https://chedotech-85bbf.web.app/dashboard/customquiz/${subject}/${docId}`,
    });
  } catch (err) {
    console.error("Error creating test:", err);
    return res.status(500).json({ error: "Server error while creating test" });
  }
});

// ✅ GET /customquiz/:subject/:docId - Get specific custom quiz
vaibhav.get("/customquiz/:subject/:docId", async (req, res) => {
  try {
    const { subject, docId } = req.params;

    if (!subject || !docId) {
      return res
        .status(400)
        .json({ error: "Missing subject or docId in params" });
    }

    const cacheKey = `customquiz_${subject}_${docId}`;
    let testData = getCache(cacheKey);

    if (!testData) {
      const testRef = db
        .collection("DynamicMcq")
        .doc(subject)
        .collection("tests")
        .doc(docId);

      const doc = await testRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: "Test not found" });
      }

      const data = doc.data();
      const mcqData = data.data || [];

      // You can optionally attach subject field to each MCQ (if needed on frontend)
      const enrichedMcqData = mcqData.map((mcq) => ({
        ...mcq,
        subject,
      }));

      testData = {
        testName: data.testName,
        docId,
        subject,
        mcqData: enrichedMcqData,
      };

      setCache(cacheKey, testData);
    }

    return res.status(200).json(testData);
  } catch (err) {
    console.error("Error fetching test:", err);
    return res.status(500).json({ error: "Server error while fetching test" });
  }
});

// ✅ OPTIMIZED: Fetch all tests across all subjects with caching
vaibhav.get("/alltests", async (req, res) => {
  try {
    const cacheKey = "all_tests";
    let allTests = getCache(cacheKey);

    if (!allTests) {
      allTests = {};
      const subjectDocs = await db.collection("DynamicMcq").listDocuments();

      for (const subjectDoc of subjectDocs) {
        const subjectName = subjectDoc.id;
        const testsRef = db
          .collection("DynamicMcq")
          .doc(subjectName)
          .collection("tests");
        const testDocs = await testsRef.get();

        const tests = [];
        testDocs.forEach((doc) => {
          const data = doc.data();
          tests.push({
            id: doc.id,
            testName: data.testName || "Untitled",
          });
        });

        allTests[subjectName] = tests;
      }

      setCache(cacheKey, allTests);
    }

    res.status(200).json(allTests);
  } catch (err) {
    console.error("🔥 Error in /alltests:", err.message);
    res
      .status(500)
      .json({ error: "Something went wrong while fetching tests." });
  }
});

//delet
vaibhav.delete("/delete/:subject/:testId", async (req, res) => {
  const { subject, testId } = req.params;
  try {
    const testRef = db
      .collection("DynamicMcq")
      .doc(subject)
      .collection("tests")
      .doc(testId);
    await testRef.delete();
    res.status(200).json({ message: "Test deleted successfully" });
  } catch (err) {
    console.error("🔥 Error deleting test:", err.message);
    res.status(500).json({ error: "Failed to delete test." });
  }
});

// GET /test/:subject/:testId
vaibhav.get("/test/:subject/:testId", async (req, res) => {
  const { subject, testId } = req.params;

  try {
    const testRef = db
      .collection("DynamicMcq")
      .doc(subject)
      .collection("tests")
      .doc(testId);

    const docSnap = await testRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ error: "Test not found" });
    }

    const testData = docSnap.data();

    res.json({
      testId: testId,
      subject: subject,
      ...testData, // contains testName, mcqData, etc.
    });
  } catch (err) {
    console.error("Failed to fetch test:", err);
    res.status(500).json({ error: "Failed to fetch test" });
  }
});

// update test
// PATCH /update/:subject/:testId
vaibhav.patch("/update/:subject/:testId", async (req, res) => {
  const { subject, testId } = req.params;
  const { testName, mcqData } = req.body; // whichever fields you want to allow updating

  try {
    if (!testName && !mcqData) {
      return res.status(400).json({ error: "Nothing to update" });
    }

    const testRef = db
      .collection("DynamicMcq")
      .doc(subject)
      .collection("tests")
      .doc(testId);

    // Prepare only the fields provided
    const updateData = {};
    if (testName) updateData.testName = testName;
    if (mcqData) updateData.mcqData = mcqData;

    await testRef.update(updateData);

    res.json({
      message: "Test updated successfully",
      updated: updateData,
    });
  } catch (err) {
    console.error("Failed to update test:", err);
    res.status(500).json({ error: "Failed to update test" });
  }
});

// POST API to add a note
vaibhav.post('/add-note', async (req, res) => {
  const { subject, code, content, heading,  unit } = req.body;

  if (!subject || !heading ||  !unit) {
    return res.status(400).json({ error: 'Missing required fields: subject, heading, id, unit' });
  }

  const subjectRef = db.collection("NotesStudy").doc(subject);
  const subjectDoc = await subjectRef.get();

  if (!subjectDoc.exists) {
    await subjectRef.set({}); // Create empty document for the subject if it doesn't exist
  }

  const noteData = {
    code: code || '',
    content: content || ' ',
    heading,
    unit: parseFloat(unit) // Assuming unit is a number
  };

  try {
    const newDocRef = await subjectRef.collection("units").add(noteData);
    res.status(201).json({ message: 'Note added successfully', docId: newDocRef.id });
  } catch (error) {
    res.status(500).json({ error: 'Error adding note: ' + error.message });
  }
});

// DELETE API to delete a note
vaibhav.delete('/delete-note', async (req, res) => {
  const { subject, docid } = req.body;

  if (!subject || !docid) {
    return res.status(400).json({ error: 'Missing required fields: subject, docid' });
  }

  const docRef = db.collection("NotesStudy").doc(subject).collection("units").doc(docid);

  try {
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Document not found' });
    }
    await docRef.delete();
    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting note: ' + error.message });
  }
});

// ✅ Test route
vaibhav.get("/test", (req, res) => {
  res.send("Hello Tanushree");
});

// ✅ Export the Express app as Firebase Function
exports.api = functions.https.onRequest(vaibhav);
