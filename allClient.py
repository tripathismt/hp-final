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
    allowed_clients = [7, 8, 10, 11, 12, 13, 14 ,15 ,22]
    while True:
        print("Enter 's' to Start.")
        print("Enter 'q' to quit.")
        
        client_input = input(f"Enter Your Choice :")

        if client_input.lower() == 'q':
            print("Exiting the program.")
            break

        try:
            for client_id in allowed_clients:
                run_client(client_id)
        except ValueError:
            print("Invalid input. Please enter a valid number or 'q' to quit.")
