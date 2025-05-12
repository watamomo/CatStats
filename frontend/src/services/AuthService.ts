import axios from "axios";

export async function loginUser(email: string, password: string) {
  const response = await axios.post("http://localhost:3000/api/auth/login", {
    email,
    password,
  });
  return response.data;
}

export async function registerUser(name: string, email: string, password: string) {
    const response = await axios.post("http://localhost:3000/api/auth/register", {
      name,
      email,
      password,
    });
    return response.data;
  }
  
  
