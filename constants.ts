import { LabScenario, StudyTopic } from "./types";

// Security Note: In a real-world app, never store passwords in client-side code.
// This is done here specifically per the user's request for a portable demo.
export const AUTH_CREDENTIALS = {
  username: 'admin',
  password: 'Bing123456'
};

export const CCNA_DOMAINS = [
  "1.0 Network Fundamentals",
  "2.0 Network Access",
  "3.0 IP Connectivity",
  "4.0 IP Services",
  "5.0 Security Fundamentals",
  "6.0 Automation and Programmability"
];

export const STUDY_TOPICS: StudyTopic[] = [
  { id: 'routing', title: 'OSPF & Static Routing', domain: '3.0 IP Connectivity', icon: 'Network' },
  { id: 'switching', title: 'VLANs & Trunking', domain: '2.0 Network Access', icon: 'Layers' },
  { id: 'security', title: 'ACLs & VPNs', domain: '5.0 Security Fundamentals', icon: 'Shield' },
  { id: 'automation', title: 'REST APIs & SDN', domain: '6.0 Automation', icon: 'Cpu' },
  { id: 'wireless', title: 'Wireless Principles', domain: '1.0 Network Fundamentals', icon: 'Wifi' },
  { id: 'services', title: 'DHCP, DNS, NAT', domain: '4.0 IP Services', icon: 'Server' },
];

export const LAB_SCENARIOS: LabScenario[] = [
  {
    id: 'vlan-config',
    title: 'VLAN & Trunk Configuration',
    difficulty: 'Beginner',
    description: 'Configure VLAN 10 and 20 on a switch and set up a trunk port.',
    objective: 'Create VLAN 10 (Sales), VLAN 20 (IT). Assign Port fa0/1 to VLAN 10. Configure fa0/24 as a Trunk.',
    initialPrompt: `Act as a Cisco IOS Switch named 'Switch1'. The user is a student. 
    Task: Create VLAN 10 named Sales, VLAN 20 named IT. Assign interface fa0/1 to VLAN 10. Configure fa0/24 as trunk.
    Start in User Exec mode (>). 
    Wait for user commands. detailedly simulate the output of commands like 'show vlan brief', 'show running-config', 'conf t', etc.
    If the user completes the objective successfully, include the string "LAB_SUCCESS" in your final output.`
  },
  {
    id: 'ospf-basic',
    title: 'Single Area OSPF',
    difficulty: 'Intermediate',
    description: 'Configure OSPF Process ID 1 in Area 0 on a Router.',
    objective: 'Enable OSPF process 1. Advertise network 192.168.1.0/24 in Area 0.',
    initialPrompt: `Act as a Cisco IOS Router named 'R1'. 
    Current state: Interface gi0/0 has IP 192.168.1.1 255.255.255.0. 
    Task: Configure OSPF process 1. Advertise network 192.168.1.0 0.0.0.255 area 0.
    Start in Privileged Exec mode (#). Simulate command outputs realistically.`
  },
  {
    id: 'acl-security',
    title: 'Standard ACL Security',
    difficulty: 'Advanced',
    description: 'Block a specific host from accessing the server network.',
    objective: 'Create a Standard ACL 10 to deny host 10.1.1.5 and permit everything else. Apply inbound on Gi0/0.',
    initialPrompt: `Act as a Cisco IOS Router named 'Gateway'. 
    Task: Create access-list 10 to deny host 10.1.1.5, permit any. Apply ip access-group 10 in on interface Gi0/0.
    Start in Global Config mode ((config)#).`
  }
];
