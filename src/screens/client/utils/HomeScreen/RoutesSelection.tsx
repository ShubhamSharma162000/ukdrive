import { Text, View } from 'dripsy';
import { useForm } from 'react-hook-form';

const truncateWords = (text = '', wordLimit = 10) => {
  const words = text.trim().split(/\s+/);
  if (words.length <= wordLimit) return text;
  return words.slice(0, wordLimit).join(' ') + '...';
};

type LatLng = { latitude: number; longitude: number };

interface RouteData {
  coordinates: LatLng[];
  distance: string;
  duration: string;
  summary: string;
}

interface RoutesSelectionProps {
  pickupLocation: string;
  destinationLocation: string;
  routesData: RouteData[];
}

export const RoutesSelection: React.FC<RoutesSelectionProps> = ({
  pickupLocation,
  destinationLocation,
  routesData,
}) => {
  console.log('in a routes selction ', routesData);
  console.log('in a routes selction ', routesData);
  console.log('in a routes selction ', routesData);
  console.log('in a routes selction ', routesData);
  console.log('in a routes selction ', routesData);
  console.log('in a routes selction ', routesData);
  return (
    <View
      sx={{
        backgroundColor: '#ffffff',
        p: 12,
        m: 10,
        borderRadius: 'l',
      }}
    >
      <Text>Route Imformation </Text>
      <Text
        sx={{
          lineHeight: 22,
          fontSize: 16,
          color: '#333',
          fontWeight: 'bold',
        }}
      >
        {/* {`${truncateWords(pickupLocation, 20)}   =>  ${truncateWords(
          destinationLocation,
          20,
        )}`} */}
      </Text>
    </View>
  );
};

const { control, watch } = useForm({
  defaultValues: { selectedRouteIndex: 1 },
});

const selectedRouteIndex = watch('selectedRouteIndex');
