export async function fetchEvents(queryKey) {
  let url = "http://localhost:3000/events";
  const search = queryKey[1]?.search;
  console.log(search);
  if (search) url += `?search=${search}`;

  const response = await fetch(url);

  if (!response.ok) {
    const error = new Error("An error occurred while fetching the events");
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const { events } = await response.json();

  return events;
}
