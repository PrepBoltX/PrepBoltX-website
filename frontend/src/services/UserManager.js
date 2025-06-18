// Singleton Pattern - User Management
class UserManager {
    static instance = null;
    currentUser = null;
    userProgress = null;

    constructor() { }

    static getInstance() {
        if (!UserManager.instance) {
            UserManager.instance = new UserManager();
        }
        return UserManager.instance;
    }

    setCurrentUser(user) {
        this.currentUser = user;
        this.loadUserProgress(user.id);
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getUserProgress() {
        return this.userProgress;
    }

    loadUserProgress(userId) {
        // Simulate loading from API/localStorage
        this.userProgress = {
            userId,
            subjectProgress: {
                'dbms': 65,
                'oops': 80,
                'system-design': 45,
                'aptitude': 90,
                'business-aptitude': 55
            },
            completedQuizzes: [],
            completedMockTests: [],
            dailyStreak: 15,
            lastActiveDate: new Date().toISOString()
        };
    }

    updateProgress(subject, progress) {
        if (this.userProgress) {
            this.userProgress.subjectProgress[subject] = progress;
        }
    }

    updateStreak() {
        if (this.userProgress) {
            const today = new Date().toDateString();
            const lastActive = new Date(this.userProgress.lastActiveDate).toDateString();

            if (today !== lastActive) {
                this.userProgress.dailyStreak += 1;
                this.userProgress.lastActiveDate = new Date().toISOString();
            }
        }
    }
}

export default UserManager; 