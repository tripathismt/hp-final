import subprocess

def run_client(client_number):
    command = f"npm run client{client_number}"
    try:
        # Run the command and capture the output
        result = subprocess.run(command, shell=True, check=True, text=True, capture_output=True)
        print("Client output:\n", result.stdout)
    except subprocess.CalledProcessError as e:
        print("Error running client:", e)
        print("Client output:\n", e.output)

if __name__ == "__main__":
    # Array of allowed client numbers
    allowed_clients = [7, 8, 10, 11, 12, 13, 14 ,15 ,22]

    while True:
        # Print available client IDs
        print("\nAvailable client IDs:")
        for client_id in allowed_clients:
            print(f"Client ID: {client_id}")
        
        print("Enter 'q' to quit.")
        
        client_input = input(f"Enter the client number to run ({', '.join(map(str, allowed_clients))}): ")

        if client_input.lower() == 'q':
            print("Exiting the program.")
            break

        try:
            client_number = int(client_input)
            if client_number in allowed_clients:
                run_client(client_number)
            else:
                print(f"Error: The entered client number {client_number} is not in the allowed list.")
                print(f"Please enter a valid client number from the following list: {allowed_clients}")
        except ValueError:
            print("Invalid input. Please enter a valid number or 'q' to quit.")
