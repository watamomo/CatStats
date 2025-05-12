import axios from "axios";

export async function fetchUserGroups(token: string) {
  const response = await axios.get("http://localhost:3000/api/groups", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}
