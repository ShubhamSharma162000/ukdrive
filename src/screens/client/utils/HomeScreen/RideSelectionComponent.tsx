// import React, { useState } from 'react';
// import { View, Text, Pressable, Image } from 'dripsy';
// import { Car, Truck, Bus } from 'lucide-react-native';

// const RideSelectionComponent = () => {
//   const [selectedRide, setSelectedRide] = useState<string | null>(null);

//   const rideOptions = [
//     {
//       id: 'economy',
//       label: 'Economy',
//       icon: Car,
//       price: '₹120',
//       desc: 'Affordable everyday rides',
//       color: '#22C55E',
//     },
//     {
//       id: 'premium',
//       label: 'Premium',
//       icon: Truck,
//       price: '₹220',
//       desc: 'Luxury and comfort',
//       color: '#3B82F6',
//     },
//     {
//       id: 'suv',
//       label: 'SUV',
//       icon: Bus,
//       price: '₹300',
//       desc: 'Spacious rides for groups',
//       color: '#F97316',
//     },
//   ];

//   return (
//     <View sx={{ mt: 20, px: 16 }}>
//       <Text
//         sx={{
//           fontSize: 22,
//           fontWeight: 'bold',
//           mb: 16,
//           color: '#111',
//         }}
//       >
//         Select Your Ride
//       </Text>

//       {rideOptions.map(ride => {
//         const Icon = ride.icon;
//         const isSelected = selectedRide === ride.id;

//         return (
//           <Pressable
//             key={ride.id}
//             onPress={() => setSelectedRide(ride.id)}
//             sx={{
//               flexDirection: 'row',
//               alignItems: 'center',
//               justifyContent: 'space-between',
//               bg: isSelected ? `${ride.color}22` : '#fff',
//               borderWidth: 2,
//               borderColor: isSelected ? ride.color : '#ddd',
//               borderRadius: 12,
//               py: 12,
//               px: 14,
//               mb: 12,
//               shadowColor: '#000',
//               shadowOpacity: 0.05,
//               shadowRadius: 3,
//               elevation: 2,
//             }}
//           >
//             <View sx={{ flexDirection: 'row', alignItems: 'center' }}>
//               <Icon size={26} color={ride.color} />
//               <View sx={{ ml: 10 }}>
//                 <Text sx={{ fontSize: 17, fontWeight: '600', color: '#111' }}>
//                   {ride.label}
//                 </Text>
//                 <Text sx={{ color: 'gray', fontSize: 13 }}>{ride.desc}</Text>
//               </View>
//             </View>

//             <Text
//               sx={{
//                 fontWeight: 'bold',
//                 fontSize: 16,
//                 color: ride.color,
//               }}
//             >
//               {ride.price}
//             </Text>
//           </Pressable>
//         );
//       })}
//     </View>
//   );
// };

// export default RideSelectionComponent;
