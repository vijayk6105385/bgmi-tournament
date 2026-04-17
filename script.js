
console.log("SCRIPT STARTED");
const ADMIN_EMAIL = "vs6105385@gmail.com"; // 👈 replace with your email
console.log("JS Loaded Successfully");
import { 
  collection, 
  getDocs, 
  addDoc, 
  doc,
  getDoc ,
  updateDoc,
  deleteDoc,
  
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { auth, db } from './firebase.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


// REGISTER
window.register = function () {
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPass").value;

    createUserWithEmailAndPassword(auth, email, password)
        .then(() => {
            showSuccess("Account created 🎉");
            showSection('login');
        })
       .catch(err => {
    console.log(err.message);

    if (err.code === "auth/email-already-in-use") {
        alert("Email already registered. Please login 🔐");
    } 
    else if (err.code === "auth/invalid-email") {
        alert("Invalid email format ❌");
    } 
    else if (err.code === "auth/weak-password") {
        alert("Password must be at least 6 characters ❌");
    } 
    else {
        alert("Registration failed ❌");
    }
});
};


window.login = function () {

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPass").value;

    console.log("Trying login with:", email, password); // DEBUG

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            showSuccess("Login successful 🎮");

            setTimeout(() => {
                showSection('tournaments');
            }, 1500);
        })
       .catch(err => {
    console.log("Login error:", err.message);

    if (err.code === "auth/invalid-credential") {
        alert("Wrong email or password ❌");
    } else {
        alert("Login failed ❌");
    }

    showError();
});
};
//edit
window.editTournament = async function (id) {

    const docRef = doc(db, "tournaments", id);
    const docSnap = await getDoc(docRef);

    const data = docSnap.data();

    const newName = prompt("Enter new match name:", data.name);
    const newFee = prompt("Enter new fee:", data.fee);
    const newSlots = prompt("Enter slots:", data.slots);
    const newTime = prompt("Enter new start time (YYYY-MM-DDTHH:MM):", data.time);
    const newNotice = prompt("Enter new notice:", data.notice);

    if (!newName || !newFee || !newSlots || !newTime) {
        alert("Update cancelled ❌");
        return;
    }
 try {
        await updateDoc(docRef, {
            name: newName,
            fee: Number(newFee),
            slots: Number(newSlots),
            time: newTime,
            notice: newNotice
        });

        alert("Updated successfully ✏️");
        loadTournaments();
    } catch (err) {
        console.error(err);
        alert("Update failed ❌");
    }
    loadTournaments();
};

async function loadTournaments() {
    // console.log("Loading tournaments..x");
    const container = document.getElementById("matchList");

container.innerHTML = `
    <div class="loader">
        <div class="spinner"></div>
    </div>

    <div class="skeleton"></div>
    <div class="skeleton"></div>
    <div class="skeleton"></div>
`;   
const querySnapshot = await getDocs(collection(db, "tournaments"));

container.innerHTML = "";

querySnapshot.forEach((docSnap, index) => {

    
        const data = docSnap.data();
        const id = docSnap.id;
        const matchTime = data.time ? new Date(data.time) : null;
        const noticeText = data.notice ? data.notice : "No updates for this match";
let formattedTime = "Not set";

if (matchTime) {
    formattedTime = matchTime.toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });
}

        let adminButtons = "";

        // 👑 Show only for admin
        if (auth.currentUser && auth.currentUser.email === ADMIN_EMAIL) {
            adminButtons = `
                <button onclick="editTournament('${id}')">✏️ Edit</button>
                <button onclick="deleteTournament('${id}')" style="background:red;">🗑 Delete</button>
            `;
        }

       container.innerHTML += `
        <div class="card" style="animation-delay:${index * 0.1}s">
        <h3>🎮 ${data.name}</h3>
       <p><strong>💰 Entry Fee:</strong> ₹${data.fee || 0}</p>
       <p><strong>👥 Slots Left:</strong> ${data.slots || 0}</p>
       <p><strong>⏰ Start:</strong> ${formattedTime}</p>
   <div class="notice-box">
            📢 ${noticeText}
        </div>

       <button onclick="showRoomInCard('${id}')">Join</button>

<div id="room-${id}" class="room-box" style="display:none;">
    <p><strong>ID:</strong> <span id="id-${id}"></span></p>
    <p><strong>Password:</strong> <span id="pass-${id}"></span></p>
</div>

        ${
            auth.currentUser && auth.currentUser.email === ADMIN_EMAIL
            ? `
            <button onclick="editTournament('${id}')">✏️ Edit</button>
            <button onclick="deleteTournament('${id}')">🗑️ Delete</button>
            `
            : ""
        }
    </div>
`;
    console.log("Data:", docSnap.data());
    });

}

window.deleteTournament = async function (id) {

    const confirmDelete = confirm("Delete this tournament?");

    if (!confirmDelete) return;
  try {
        await deleteDoc(doc(db, "tournaments", id));
        alert("Deleted successfully 🗑️");

        loadTournaments(); // refresh list
    } catch (err) {
        console.error(err);
        alert("Delete failed ❌");
    }
};

// JOIN MATCH


window.joinMatch = async function (id) {

    if (!auth.currentUser) {
        alert("Please login first ❌");
        return;
    }

    const docRef = doc(db, "tournaments", id);
    const docSnap = await getDoc(docRef);

    const data = docSnap.data();

    // Show popup
    document.getElementById("roomId").innerText = data.roomId;
    document.getElementById("roomPass").innerText = data.password;

    document.getElementById("roomPopup").style.display = "flex";
};


window.showSection = function (id) {

    // 🔐 Admin protection
    if (id === "admin") {
        if (!auth.currentUser) {
            alert("Login required ❌");
            return;
        }

        if (auth.currentUser.email !== ADMIN_EMAIL) {
            alert("Access denied ❌ (Admin only)");
            return;
        }
    }

    // 🔐 Tournament protection
    if (id === "tournaments") {
        if (!auth.currentUser) {
            alert("Please login to view tournaments 🔐");
            return;
        }
    }

    document.querySelectorAll("section").forEach(sec => {
        sec.classList.remove("active");
    });

    document.getElementById(id).classList.add("active");

   if (id === "tournaments") {
    console.log("Tournaments clicked"); // add this
    loadTournaments();
}

    if (id === "leaderboard") {
        loadLeaderboard();
    }
};
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
    const adminBtn = document.getElementById("adminBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const userEmail = document.getElementById("userEmail");

    if (user) {
        // 👤 Show user email
        userEmail.innerText = user.email;

        // 🔓 Show logout
        logoutBtn.style.display = "inline-block";

        // 👑 Admin check
        if (user.email === ADMIN_EMAIL) {
            adminBtn.style.display = "inline-block";
        } else {
            adminBtn.style.display = "none";
        }

    } else {
        // ❌ Hide everything
        userEmail.innerText = "";
        logoutBtn.style.display = "none";
        adminBtn.style.display = "none";
    }
});
console.log("JS Loaded");




const matches = {
    match1: {
        roomId: "123456",
        password: "bgmi123"
    },
    match2: {
        roomId: "789101",
        password: "solo123"
    }
};



window.closePopup = function () {
    document.getElementById("roomPopup").style.display = "none";
};

window.copyText = function (id) {
    const text = document.getElementById(id).innerText;
    navigator.clipboard.writeText(text);
    alert("Copied: " + text);
};


window.addTournament = async function () {

    const name = document.getElementById("adminName").value;
    const fee = document.getElementById("adminFee").value;
    const roomId = document.getElementById("adminRoomId").value;
    const password = document.getElementById("adminPassword").value;
    const slots = document.getElementById("adminSlots").value;
    const time = document.getElementById("adminTime").value;
    const notice = document.getElementById("adminNotice").value;

    if (!name || !fee || !roomId || !password || !slots) {
        alert("Fill all fields ❌");
        return;
    }

    try {
        await addDoc(collection(db, "tournaments"), {
    name: name,
    fee: Number(fee),
    roomId: roomId,
    password: password,
    slots: Number(slots),
    time: time,
    notice: notice   // ✅ ADD THIS
});

        alert("Tournament Added Successfully ✅");

        // Clear fields
        document.getElementById("adminName").value = "";
        document.getElementById("adminFee").value = "";
        document.getElementById("adminRoomId").value = "";
        document.getElementById("adminPassword").value = "";
        document.getElementById("adminSlots").value = "";

    } catch (error) {
        console.error(error);
        alert("Error adding tournament ❌");
    }


};
window.togglePassword = function(id, icon) {
    const input = document.getElementById(id);

    if (input.type === "password") {
        input.type = "text";
        icon.innerText = "🙈";
    } else {
        input.type = "password";
        icon.innerText = "👁";
    }
};

function showError() {
    const box = document.querySelector("#login .auth-container");

    box.classList.add("shake");

    setTimeout(() => {
        box.classList.remove("shake");
    }, 300);
}

window.showSuccess = function(message) {
    const popup = document.getElementById("successPopup");
    const text = document.getElementById("successMessage");

    text.innerText = message;
    popup.style.display = "flex";

    setTimeout(() => {
        popup.style.display = "none";
    }, 2000);
};


window.logout = function () {
    signOut(auth)
        .then(() => {
            showSuccess("Logged out 👋");
            showSection('home');
        })
        .catch(err => {
            alert("Logout failed ❌");
        });
};

window.showRoomInCard = async function (id) {

    if (!auth.currentUser) {
        alert("Please login first ❌");
        return;
    }

    const docRef = doc(db, "tournaments", id);
    const docSnap = await getDoc(docRef);
    const data = docSnap.data();

    // show values
    document.getElementById(`id-${id}`).innerText = data.roomId;
    document.getElementById(`pass-${id}`).innerText = data.password;

    // show div
    document.getElementById(`room-${id}`).style.display = "block";
};