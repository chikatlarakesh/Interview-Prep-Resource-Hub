document.addEventListener("DOMContentLoaded", function () {
    console.log("🚀 Checking authentication...");

    const token = localStorage.getItem("token");
    const userName = localStorage.getItem("name");

    if (!token) {
        alert("Unauthorized access! Please login first.");
        window.location.href = "login.html";
        return;
    }

    // ✅ Fetch user details
    fetch("http://localhost:3000/dashboard", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert("Session expired. Please log in again.");
            localStorage.removeItem("token");
            window.location.href = "login.html";
        } else {
            document.getElementById("user-welcome").textContent = `Welcome, ${userName}!`;
            document.getElementById("user-name").textContent = `Name: ${userName}`;
            document.getElementById("user-email").textContent = `Email: ${data.user.email}`;
        }
    })
    .catch(error => {
        console.error("❌ Error fetching dashboard:", error);
        alert("Something went wrong!");
    });

    // ✅ Fetch and Display Categorized GitHub Resources
    fetch("http://localhost:3000/resources")
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert("Failed to load resources!");
                return;
            }

            const resourcesContainer = document.getElementById("resources-container");
            resourcesContainer.innerHTML = ""; // Clear previous content

            const categories = {
                "DSA": [],
                "System Design": [],
                "Web Development": [],
                "Operating Systems": [],
                "Computer Networks": [],
                "Miscellaneous": []
            };

            // ✅ Categorize resources based on filenames
            data.resources.forEach(resource => {
                const lowerName = resource.name.toLowerCase();
                if (lowerName.includes("dsa")) {
                    categories["DSA"].push(resource);
                } else if (lowerName.includes("system") || lowerName.includes("design")) {
                    categories["System Design"].push(resource);
                } else if (lowerName.includes("web") || lowerName.includes("html") || lowerName.includes("css") || lowerName.includes("js")) {
                    categories["Web Development"].push(resource);
                } else if (lowerName.includes("os") || lowerName.includes("operating")) {
                    categories["Operating Systems"].push(resource);
                } else if (lowerName.includes("network") || lowerName.includes("cn")) {
                    categories["Computer Networks"].push(resource);
                } else {
                    categories["Miscellaneous"].push(resource);
                }
            });

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
        .catch(error => {
            console.error("❌ Error fetching resources:", error);
        });
});

// ✅ Search Functionality
function searchResources() {
    const query = document.getElementById("search-input").value.toLowerCase();
    const categories = document.querySelectorAll(".resource-category");

    categories.forEach(category => {
        let hasMatch = false;
        const items = category.querySelectorAll(".resource-list li");

        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (text.includes(query)) {
                item.style.display = "block";
                hasMatch = true;
            } else {
                item.style.display = "none";
            }
        });

        // ✅ Show category only if there are matching results
        category.style.display = hasMatch ? "block" : "none";
    });
}

// ✅ Logout Function with Confirmation
function logout() {
    const confirmLogout = confirm("Are you sure you want to log out?");
    if (confirmLogout) {
        console.log("🚀 Logging out...");
        localStorage.removeItem("token");
        localStorage.removeItem("name");
        localStorage.removeItem("email");

        fetch("http://localhost:3000/logout", { method: "POST" })
            .then(() => {
                alert("Logged out successfully!");
                window.location.href = "login.html";
            });
    }
}

// ✅ Profile Edit Function
function editProfile() {
    document.getElementById("edit-profile-popup").style.display = "block";
}

// ✅ Close Profile Popup
function closePopup() {
    document.getElementById("edit-profile-popup").style.display = "none";
}

// ✅ Update Profile Function
function updateProfile() {
    const newName = document.getElementById("new-name").value;
    const newEmail = document.getElementById("new-email").value;
    const token = localStorage.getItem("token");

    if (!newName || !newEmail) {
        alert("Please fill in all fields.");
        return;
    }

    fetch("http://localhost:3000/update-profile", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: newName, email: newEmail })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            alert("Profile updated successfully!");
            localStorage.setItem("name", newName);
            localStorage.setItem("email", newEmail);
            closePopup();
            window.location.reload();
        }
    })
    .catch(error => {
        console.error("❌ Error updating profile:", error);
        alert("Something went wrong!");
    });
}
