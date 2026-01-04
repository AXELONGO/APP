import os
import argparse

def get_files(directory, exclude_dirs=None, exclude_files=None):
    file_list = []
    exclude_dirs = exclude_dirs or []
    exclude_files = exclude_files or []

    for root, dirs, files in os.walk(directory):
        # Filter directories
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        for file in files:
            if file in exclude_files:
                continue
            file_path = os.path.join(root, file)
            file_list.append(file_path)
    return sorted(file_list)

def main():
    parser = argparse.ArgumentParser(description='Prepare files for upload')
    parser.add_argument('--start', type=int, default=0, help='Start index of files to output')
    parser.add_argument('--end', type=int, default=None, help='End index of files to output')
    parser.add_argument('--dir', type=str, default='frontend', help='Directory to walk')
    parser.add_argument('--list', action='store_true', help='List files only')
    args = parser.parse_args()

    exclude_dirs = ['node_modules', '.git', '__pycache__', 'dist', 'build', '.next', '.mw']
    exclude_files = ['package-lock.json', '.DS_Store']

    files = get_files(args.dir, exclude_dirs, exclude_files)

    if args.list:
        for i, f in enumerate(files):
            print(f"{i}: {f}")
        return

    start = args.start
    end = args.end if args.end is not None else len(files)

    print(f"Processing files {start} to {end} of {len(files)} in {args.dir}...")

    # Output format for tool consumption
    output = []
    
    # Simple limit to avoid massive outputs if not batched
    # But relies on user/tool to set reasonable batches
    
    for i in range(start, min(end, len(files))):
        file_path = files[i]
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                # Create a simple JSON-like structure or just raw text that the agent can parse
                # Using a delimiter for safety
                print(f"\n--- START FILE: {file_path} ---")
                print(content)
                print(f"\n--- END FILE: {file_path} ---")
        except Exception as e:
            print(f"Error reading {file_path}: {e}")

if __name__ == "__main__":
    main()
