// Mock authentication service
// In production, replace with real API calls to your backend

const USERS_KEY = 'et_users';

const getUsers = () => JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
const saveUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));

// Simple mock JWT generator
const mockToken = (userId) => btoa(JSON.stringify({ userId, exp: Date.now() + 86400000 }));

export const authService = {
  signup: async (name, email, password) => {
    await new Promise(r => setTimeout(r, 600)); // Simulate network delay
    const users = getUsers();
    if (users.find(u => u.email === email)) {
      throw new Error('Email already registered');
    }
    const user = { id: Date.now().toString(), name, email, password, avatar: name[0].toUpperCase() };
    saveUsers([...users, user]);
    const token = mockToken(user.id);
    return { user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar }, token };
  },

  login: async (email, password) => {
    await new Promise(r => setTimeout(r, 600));
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) throw new Error('Invalid email or password');
    const token = mockToken(user.id);
    return { user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar }, token };
  },
};
