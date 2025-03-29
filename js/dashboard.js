document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
  
    if (!token) {
      alert("Unauthorized access! Please login first.");
      window.location.href = "login.html";
      return;
    }
    console.log("📥 Sending token to dashboard API:", token);
    fetch("http://localhost:3000/dashboard", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        alert("Session expired. Please log in again.");
        localStorage.clear();
        window.location.href = "login.html";
      } else {
        const user = data.user;
        document.getElementById("user-welcome").textContent = `Welcome, ${user.name}!`;
        document.getElementById("user-name").textContent = `Name: ${user.name}`;
        document.getElementById("user-email").textContent = `Email: ${user.email}`;
        document.getElementById("user-dob").textContent = `Date of Birth: ${user.dob || "N/A"}`;
        document.getElementById("user-mobile").textContent = `Mobile Number: ${user.mobile || "N/A"}`;
        document.getElementById("user-pincode").textContent = `Pincode: ${user.pincode || "N/A"}`;
        document.getElementById("user-subject").textContent = `Subject Interest: ${user.subject_interest || "N/A"}`;
        document.getElementById("user-created").textContent = `Account Created: ${user.created_at || "N/A"}`;
      }
    })
    .catch(err => {
      console.error("❌ Error fetching dashboard details:", err);
    });
  
    fetch("http://localhost:3000/resources")
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        alert("Failed to load resources!");
        return;
      }
  
      const categories = {
        "DSA": [],
        "System Design": [],
        "Web Development": [],
        "Operating Systems": [],
        "Computer Networks": [],
        "Miscellaneous": []
      };
  
      data.resources.forEach(resource => {
        const lowerName = resource.name.toLowerCase();
        if (lowerName.includes("dsa")) categories["DSA"].push(resource);
        else if (lowerName.includes("system") || lowerName.includes("design")) categories["System Design"].push(resource);
        else if (lowerName.includes("web") || lowerName.includes("html") || lowerName.includes("css") || lowerName.includes("js")) categories["Web Development"].push(resource);
        else if (lowerName.includes("os") || lowerName.includes("operating")) categories["Operating Systems"].push(resource);
        else if (lowerName.includes("network") || lowerName.includes("cn")) categories["Computer Networks"].push(resource);
        else categories["Miscellaneous"].push(resource);
      });
  
      const resourcesContainer = document.getElementById("resources-container");
      resourcesContainer.innerHTML = "";
  
      Object.entries(categories).forEach(([category, files]) => {
        if (files.length > 0) {
          const section = document.createElement("section");
          section.classList.add("resource-category");
  
          const title = document.createElement("h2");
          title.textContent = category;
          section.appendChild(title);
  
          const list = document.createElement("ul");
          list.classList.add("resource-list");
  
          files.forEach(resource => {
            const listItem = document.createElement("li");
            const link = document.createElement("a");
            link.href = resource.url;
            link.textContent = resource.name;
            link.target = "_blank";
            listItem.appendChild(link);
            list.appendChild(listItem);
          });
  
          section.appendChild(list);
          resourcesContainer.appendChild(section);
        }
      });
    })
    .catch(err => {
      console.error("❌ Error fetching resources:", err);
    });
  });
  
  function logout() {
    if (confirm("Are you sure you want to log out?")) {
      localStorage.clear();
      fetch("http://localhost:3000/logout", { method: "POST" })
        .then(() => {
          alert("Logged out successfully!");
          window.location.href = "login.html";
        });
    }
  }
  
  function editProfile() {
    document.getElementById("edit-profile-popup").style.display = "block";
  }
  
  function closePopup() {
    document.getElementById("edit-profile-popup").style.display = "none";
  }
  
  function updateProfile() {
    const token = localStorage.getItem("token");
  
    const updatedData = {
      name: document.getElementById("new-name").value,
      email: document.getElementById("new-email").value,
      dob: document.getElementById("new-dob").value,
      mobile: document.getElementById("new-mobile").value,
      pincode: document.getElementById("new-pincode").value,
      subject_interest: document.getElementById("new-subject").value
    };
  
    if (Object.values(updatedData).some(value => !value.trim())) {
      alert("Please fill in all fields.");
      return;
    }
  
    fetch("http://localhost:3000/update-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updatedData)
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
      } else {
        alert("Profile updated successfully!");
        closePopup();
        window.location.reload();
      }
    })
    .catch(err => {
      console.error("❌ Error updating profile:", err);
      alert("Something went wrong!");
    });
  }
  