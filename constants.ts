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

// Ordered according to learning path
export const STUDY_TOPICS: StudyTopic[] = [
  // 1.0 Fundamentals
  { id: 'components', title: 'Network Components & Cabling', domain: '1.0 Network Fundamentals', icon: 'Server' },
  { id: 'tcp-udp', title: 'TCP vs UDP & IPv4 Addressing', domain: '1.0 Network Fundamentals', icon: 'Network' },
  { id: 'ipv6', title: 'IPv6 Address Types', domain: '1.0 Network Fundamentals', icon: 'Hash' },
  
  // 2.0 Network Access
  { id: 'vlans', title: 'VLANs & 802.1Q Trunking', domain: '2.0 Network Access', icon: 'Layers' },
  { id: 'stp', title: 'Spanning Tree Protocol (STP)', domain: '2.0 Network Access', icon: 'GitBranch' },
  { id: 'etherchannel', title: 'EtherChannel (LACP)', domain: '2.0 Network Access', icon: 'Link' },
  { id: 'wlan', title: 'Wireless Architectures & AP Modes', domain: '2.0 Network Access', icon: 'Wifi' },

  // 3.0 IP Connectivity
  { id: 'routing-table', title: 'Routing Table Logic', domain: '3.0 IP Connectivity', icon: 'Map' },
  { id: 'static-routing', title: 'Static Routing & Default Routes', domain: '3.0 IP Connectivity', icon: 'ArrowRight' },
  { id: 'ospf', title: 'OSPFv2 Concepts & Config', domain: '3.0 IP Connectivity', icon: 'Activity' },
  { id: 'fhrp', title: 'First Hop Redundancy (HSRP)', domain: '3.0 IP Connectivity', icon: 'Copy' },

  // 4.0 IP Services
  { id: 'nat', title: 'NAT (Static, Dynamic, PAT)', domain: '4.0 IP Services', icon: 'Globe' },
  { id: 'dhcp-dns', title: 'DHCP & DNS', domain: '4.0 IP Services', icon: 'Database' },
  { id: 'snmp-syslog', title: 'SNMP & Syslog', domain: '4.0 IP Services', icon: 'FileText' },

  // 5.0 Security
  { id: 'security-concepts', title: 'Security Concepts (CIA, Threats)', domain: '5.0 Security Fundamentals', icon: 'Shield' },
  { id: 'acls', title: 'Access Control Lists (ACLs)', domain: '5.0 Security Fundamentals', icon: 'Lock' },
  { id: 'l2-security', title: 'L2 Security (DHCP Snooping, ARP)', domain: '5.0 Security Fundamentals', icon: 'ShieldCheck' },
  { id: 'vpns', title: 'VPN Types (Site-to-Site, Remote)', domain: '5.0 Security Fundamentals', icon: 'Unlock' },

  // 6.0 Automation
  { id: 'automation-basics', title: 'Automation & SDN Controller', domain: '6.0 Automation', icon: 'Cpu' },
  { id: 'apis', title: 'REST APIs & JSON', domain: '6.0 Automation', icon: 'Code' },
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