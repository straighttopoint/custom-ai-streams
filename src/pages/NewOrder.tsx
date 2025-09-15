import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { add } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, UserIcon, BuildingIcon, HashIcon, ClockIcon, CreditCardIcon, ExternalLinkIcon, PhoneIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Time slots for scheduling
const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", 
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
];

// Comprehensive country codes data
const countryCodes = [
  { code: "+1", country: "United States", countryCode: "US", flag: "🇺🇸", minLength: 10, maxLength: 10 },
  { code: "+1", country: "Canada", countryCode: "CA", flag: "🇨🇦", minLength: 10, maxLength: 10 },
  { code: "+7", country: "Russia", countryCode: "RU", flag: "🇷🇺", minLength: 10, maxLength: 10 },
  { code: "+20", country: "Egypt", countryCode: "EG", flag: "🇪🇬", minLength: 10, maxLength: 10 },
  { code: "+27", country: "South Africa", countryCode: "ZA", flag: "🇿🇦", minLength: 9, maxLength: 9 },
  { code: "+30", country: "Greece", countryCode: "GR", flag: "🇬🇷", minLength: 10, maxLength: 10 },
  { code: "+31", country: "Netherlands", countryCode: "NL", flag: "🇳🇱", minLength: 9, maxLength: 9 },
  { code: "+32", country: "Belgium", countryCode: "BE", flag: "🇧🇪", minLength: 9, maxLength: 9 },
  { code: "+33", country: "France", countryCode: "FR", flag: "🇫🇷", minLength: 9, maxLength: 10 },
  { code: "+34", country: "Spain", countryCode: "ES", flag: "🇪🇸", minLength: 9, maxLength: 9 },
  { code: "+36", country: "Hungary", countryCode: "HU", flag: "🇭🇺", minLength: 9, maxLength: 9 },
  { code: "+39", country: "Italy", countryCode: "IT", flag: "🇮🇹", minLength: 10, maxLength: 11 },
  { code: "+40", country: "Romania", countryCode: "RO", flag: "🇷🇴", minLength: 9, maxLength: 9 },
  { code: "+41", country: "Switzerland", countryCode: "CH", flag: "🇨🇭", minLength: 9, maxLength: 9 },
  { code: "+43", country: "Austria", countryCode: "AT", flag: "🇦🇹", minLength: 10, maxLength: 11 },
  { code: "+44", country: "United Kingdom", countryCode: "GB", flag: "🇬🇧", minLength: 10, maxLength: 11 },
  { code: "+45", country: "Denmark", countryCode: "DK", flag: "🇩🇰", minLength: 8, maxLength: 8 },
  { code: "+46", country: "Sweden", countryCode: "SE", flag: "🇸🇪", minLength: 9, maxLength: 10 },
  { code: "+47", country: "Norway", countryCode: "NO", flag: "🇳🇴", minLength: 8, maxLength: 8 },
  { code: "+48", country: "Poland", countryCode: "PL", flag: "🇵🇱", minLength: 9, maxLength: 9 },
  { code: "+49", country: "Germany", countryCode: "DE", flag: "🇩🇪", minLength: 10, maxLength: 12 },
  { code: "+51", country: "Peru", countryCode: "PE", flag: "🇵🇪", minLength: 9, maxLength: 9 },
  { code: "+52", country: "Mexico", countryCode: "MX", flag: "🇲🇽", minLength: 10, maxLength: 10 },
  { code: "+53", country: "Cuba", countryCode: "CU", flag: "🇨🇺", minLength: 8, maxLength: 8 },
  { code: "+54", country: "Argentina", countryCode: "AR", flag: "🇦🇷", minLength: 10, maxLength: 11 },
  { code: "+55", country: "Brazil", countryCode: "BR", flag: "🇧🇷", minLength: 10, maxLength: 11 },
  { code: "+56", country: "Chile", countryCode: "CL", flag: "🇨🇱", minLength: 9, maxLength: 9 },
  { code: "+57", country: "Colombia", countryCode: "CO", flag: "🇨🇴", minLength: 10, maxLength: 10 },
  { code: "+58", country: "Venezuela", countryCode: "VE", flag: "🇻🇪", minLength: 10, maxLength: 10 },
  { code: "+60", country: "Malaysia", countryCode: "MY", flag: "🇲🇾", minLength: 9, maxLength: 10 },
  { code: "+61", country: "Australia", countryCode: "AU", flag: "🇦🇺", minLength: 9, maxLength: 9 },
  { code: "+62", country: "Indonesia", countryCode: "ID", flag: "🇮🇩", minLength: 10, maxLength: 12 },
  { code: "+63", country: "Philippines", countryCode: "PH", flag: "🇵🇭", minLength: 10, maxLength: 10 },
  { code: "+64", country: "New Zealand", countryCode: "NZ", flag: "🇳🇿", minLength: 8, maxLength: 9 },
  { code: "+65", country: "Singapore", countryCode: "SG", flag: "🇸🇬", minLength: 8, maxLength: 8 },
  { code: "+66", country: "Thailand", countryCode: "TH", flag: "🇹🇭", minLength: 9, maxLength: 9 },
  { code: "+81", country: "Japan", countryCode: "JP", flag: "🇯🇵", minLength: 10, maxLength: 11 },
  { code: "+82", country: "South Korea", countryCode: "KR", flag: "🇰🇷", minLength: 10, maxLength: 11 },
  { code: "+84", country: "Vietnam", countryCode: "VN", flag: "🇻🇳", minLength: 9, maxLength: 10 },
  { code: "+86", country: "China", countryCode: "CN", flag: "🇨🇳", minLength: 11, maxLength: 11 },
  { code: "+90", country: "Turkey", countryCode: "TR", flag: "🇹🇷", minLength: 10, maxLength: 10 },
  { code: "+91", country: "India", countryCode: "IN", flag: "🇮🇳", minLength: 10, maxLength: 10 },
  { code: "+92", country: "Pakistan", countryCode: "PK", flag: "🇵🇰", minLength: 10, maxLength: 10 },
  { code: "+93", country: "Afghanistan", countryCode: "AF", flag: "🇦🇫", minLength: 9, maxLength: 9 },
  { code: "+94", country: "Sri Lanka", countryCode: "LK", flag: "🇱🇰", minLength: 9, maxLength: 9 },
  { code: "+95", country: "Myanmar", countryCode: "MM", flag: "🇲🇲", minLength: 8, maxLength: 10 },
  { code: "+98", country: "Iran", countryCode: "IR", flag: "🇮🇷", minLength: 10, maxLength: 10 },
  { code: "+212", country: "Morocco", countryCode: "MA", flag: "🇲🇦", minLength: 9, maxLength: 9 },
  { code: "+213", country: "Algeria", countryCode: "DZ", flag: "🇩🇿", minLength: 9, maxLength: 9 },
  { code: "+216", country: "Tunisia", countryCode: "TN", flag: "🇹🇳", minLength: 8, maxLength: 8 },
  { code: "+218", country: "Libya", countryCode: "LY", flag: "🇱🇾", minLength: 9, maxLength: 9 },
  { code: "+220", country: "Gambia", countryCode: "GM", flag: "🇬🇲", minLength: 7, maxLength: 7 },
  { code: "+221", country: "Senegal", countryCode: "SN", flag: "🇸🇳", minLength: 9, maxLength: 9 },
  { code: "+222", country: "Mauritania", countryCode: "MR", flag: "🇲🇷", minLength: 8, maxLength: 8 },
  { code: "+223", country: "Mali", countryCode: "ML", flag: "🇲🇱", minLength: 8, maxLength: 8 },
  { code: "+224", country: "Guinea", countryCode: "GN", flag: "🇬🇳", minLength: 9, maxLength: 9 },
  { code: "+225", country: "Ivory Coast", countryCode: "CI", flag: "🇨🇮", minLength: 8, maxLength: 8 },
  { code: "+226", country: "Burkina Faso", countryCode: "BF", flag: "🇧🇫", minLength: 8, maxLength: 8 },
  { code: "+227", country: "Niger", countryCode: "NE", flag: "🇳🇪", minLength: 8, maxLength: 8 },
  { code: "+228", country: "Togo", countryCode: "TG", flag: "🇹🇬", minLength: 8, maxLength: 8 },
  { code: "+229", country: "Benin", countryCode: "BJ", flag: "🇧🇯", minLength: 8, maxLength: 8 },
  { code: "+230", country: "Mauritius", countryCode: "MU", flag: "🇲🇺", minLength: 7, maxLength: 8 },
  { code: "+231", country: "Liberia", countryCode: "LR", flag: "🇱🇷", minLength: 7, maxLength: 8 },
  { code: "+232", country: "Sierra Leone", countryCode: "SL", flag: "🇸🇱", minLength: 8, maxLength: 8 },
  { code: "+233", country: "Ghana", countryCode: "GH", flag: "🇬🇭", minLength: 9, maxLength: 9 },
  { code: "+234", country: "Nigeria", countryCode: "NG", flag: "🇳🇬", minLength: 10, maxLength: 11 },
  { code: "+235", country: "Chad", countryCode: "TD", flag: "🇹🇩", minLength: 8, maxLength: 8 },
  { code: "+236", country: "Central African Republic", countryCode: "CF", flag: "🇨🇫", minLength: 8, maxLength: 8 },
  { code: "+237", country: "Cameroon", countryCode: "CM", flag: "🇨🇲", minLength: 9, maxLength: 9 },
  { code: "+238", country: "Cape Verde", countryCode: "CV", flag: "🇨🇻", minLength: 7, maxLength: 7 },
  { code: "+239", country: "São Tomé and Príncipe", countryCode: "ST", flag: "🇸🇹", minLength: 7, maxLength: 7 },
  { code: "+240", country: "Equatorial Guinea", countryCode: "GQ", flag: "🇬🇶", minLength: 9, maxLength: 9 },
  { code: "+241", country: "Gabon", countryCode: "GA", flag: "🇬🇦", minLength: 7, maxLength: 8 },
  { code: "+242", country: "Republic of the Congo", countryCode: "CG", flag: "🇨🇬", minLength: 9, maxLength: 9 },
  { code: "+243", country: "Democratic Republic of the Congo", countryCode: "CD", flag: "🇨🇩", minLength: 9, maxLength: 9 },
  { code: "+244", country: "Angola", countryCode: "AO", flag: "🇦🇴", minLength: 9, maxLength: 9 },
  { code: "+245", country: "Guinea-Bissau", countryCode: "GW", flag: "🇬🇼", minLength: 7, maxLength: 7 },
  { code: "+246", country: "British Indian Ocean Territory", countryCode: "IO", flag: "🇮🇴", minLength: 7, maxLength: 7 },
  { code: "+248", country: "Seychelles", countryCode: "SC", flag: "🇸🇨", minLength: 7, maxLength: 7 },
  { code: "+249", country: "Sudan", countryCode: "SD", flag: "🇸🇩", minLength: 9, maxLength: 9 },
  { code: "+250", country: "Rwanda", countryCode: "RW", flag: "🇷🇼", minLength: 9, maxLength: 9 },
  { code: "+251", country: "Ethiopia", countryCode: "ET", flag: "🇪🇹", minLength: 9, maxLength: 9 },
  { code: "+252", country: "Somalia", countryCode: "SO", flag: "🇸🇴", minLength: 8, maxLength: 9 },
  { code: "+253", country: "Djibouti", countryCode: "DJ", flag: "🇩🇯", minLength: 8, maxLength: 8 },
  { code: "+254", country: "Kenya", countryCode: "KE", flag: "🇰🇪", minLength: 9, maxLength: 9 },
  { code: "+255", country: "Tanzania", countryCode: "TZ", flag: "🇹🇿", minLength: 9, maxLength: 9 },
  { code: "+256", country: "Uganda", countryCode: "UG", flag: "🇺🇬", minLength: 9, maxLength: 9 },
  { code: "+257", country: "Burundi", countryCode: "BI", flag: "🇧🇮", minLength: 8, maxLength: 8 },
  { code: "+258", country: "Mozambique", countryCode: "MZ", flag: "🇲🇿", minLength: 9, maxLength: 9 },
  { code: "+260", country: "Zambia", countryCode: "ZM", flag: "🇿🇲", minLength: 9, maxLength: 9 },
  { code: "+261", country: "Madagascar", countryCode: "MG", flag: "🇲🇬", minLength: 9, maxLength: 9 },
  { code: "+262", country: "Réunion", countryCode: "RE", flag: "🇷🇪", minLength: 9, maxLength: 9 },
  { code: "+263", country: "Zimbabwe", countryCode: "ZW", flag: "🇿🇼", minLength: 9, maxLength: 9 },
  { code: "+264", country: "Namibia", countryCode: "NA", flag: "🇳🇦", minLength: 8, maxLength: 9 },
  { code: "+265", country: "Malawi", countryCode: "MW", flag: "🇲🇼", minLength: 8, maxLength: 9 },
  { code: "+266", country: "Lesotho", countryCode: "LS", flag: "🇱🇸", minLength: 8, maxLength: 8 },
  { code: "+267", country: "Botswana", countryCode: "BW", flag: "🇧🇼", minLength: 8, maxLength: 8 },
  { code: "+268", country: "Eswatini", countryCode: "SZ", flag: "🇸🇿", minLength: 8, maxLength: 8 },
  { code: "+269", country: "Comoros", countryCode: "KM", flag: "🇰🇲", minLength: 7, maxLength: 7 },
  { code: "+290", country: "Saint Helena", countryCode: "SH", flag: "🇸🇭", minLength: 4, maxLength: 4 },
  { code: "+291", country: "Eritrea", countryCode: "ER", flag: "🇪🇷", minLength: 7, maxLength: 7 },
  { code: "+297", country: "Aruba", countryCode: "AW", flag: "🇦🇼", minLength: 7, maxLength: 7 },
  { code: "+298", country: "Faroe Islands", countryCode: "FO", flag: "🇫🇴", minLength: 6, maxLength: 6 },
  { code: "+299", country: "Greenland", countryCode: "GL", flag: "🇬🇱", minLength: 6, maxLength: 6 },
  { code: "+350", country: "Gibraltar", countryCode: "GI", flag: "🇬🇮", minLength: 8, maxLength: 8 },
  { code: "+351", country: "Portugal", countryCode: "PT", flag: "🇵🇹", minLength: 9, maxLength: 9 },
  { code: "+352", country: "Luxembourg", countryCode: "LU", flag: "🇱🇺", minLength: 9, maxLength: 9 },
  { code: "+353", country: "Ireland", countryCode: "IE", flag: "🇮🇪", minLength: 9, maxLength: 9 },
  { code: "+354", country: "Iceland", countryCode: "IS", flag: "🇮🇸", minLength: 7, maxLength: 7 },
  { code: "+355", country: "Albania", countryCode: "AL", flag: "🇦🇱", minLength: 9, maxLength: 9 },
  { code: "+356", country: "Malta", countryCode: "MT", flag: "🇲🇹", minLength: 8, maxLength: 8 },
  { code: "+357", country: "Cyprus", countryCode: "CY", flag: "🇨🇾", minLength: 8, maxLength: 8 },
  { code: "+358", country: "Finland", countryCode: "FI", flag: "🇫🇮", minLength: 9, maxLength: 10 },
  { code: "+359", country: "Bulgaria", countryCode: "BG", flag: "🇧🇬", minLength: 9, maxLength: 9 },
  { code: "+370", country: "Lithuania", countryCode: "LT", flag: "🇱🇹", minLength: 8, maxLength: 8 },
  { code: "+371", country: "Latvia", countryCode: "LV", flag: "🇱🇻", minLength: 8, maxLength: 8 },
  { code: "+372", country: "Estonia", countryCode: "EE", flag: "🇪🇪", minLength: 7, maxLength: 8 },
  { code: "+373", country: "Moldova", countryCode: "MD", flag: "🇲🇩", minLength: 8, maxLength: 8 },
  { code: "+374", country: "Armenia", countryCode: "AM", flag: "🇦🇲", minLength: 8, maxLength: 8 },
  { code: "+375", country: "Belarus", countryCode: "BY", flag: "🇧🇾", minLength: 9, maxLength: 9 },
  { code: "+376", country: "Andorra", countryCode: "AD", flag: "🇦🇩", minLength: 6, maxLength: 6 },
  { code: "+377", country: "Monaco", countryCode: "MC", flag: "🇲🇨", minLength: 8, maxLength: 9 },
  { code: "+378", country: "San Marino", countryCode: "SM", flag: "🇸🇲", minLength: 10, maxLength: 10 },
  { code: "+380", country: "Ukraine", countryCode: "UA", flag: "🇺🇦", minLength: 9, maxLength: 9 },
  { code: "+381", country: "Serbia", countryCode: "RS", flag: "🇷🇸", minLength: 9, maxLength: 9 },
  { code: "+382", country: "Montenegro", countryCode: "ME", flag: "🇲🇪", minLength: 8, maxLength: 8 },
  { code: "+383", country: "Kosovo", countryCode: "XK", flag: "🇽🇰", minLength: 8, maxLength: 9 },
  { code: "+385", country: "Croatia", countryCode: "HR", flag: "🇭🇷", minLength: 9, maxLength: 9 },
  { code: "+386", country: "Slovenia", countryCode: "SI", flag: "🇸🇮", minLength: 8, maxLength: 8 },
  { code: "+387", country: "Bosnia and Herzegovina", countryCode: "BA", flag: "🇧🇦", minLength: 8, maxLength: 8 },
  { code: "+389", country: "North Macedonia", countryCode: "MK", flag: "🇲🇰", minLength: 8, maxLength: 8 },
  { code: "+420", country: "Czech Republic", countryCode: "CZ", flag: "🇨🇿", minLength: 9, maxLength: 9 },
  { code: "+421", country: "Slovakia", countryCode: "SK", flag: "🇸🇰", minLength: 9, maxLength: 9 },
  { code: "+423", country: "Liechtenstein", countryCode: "LI", flag: "🇱🇮", minLength: 7, maxLength: 7 },
  { code: "+500", country: "Falkland Islands", countryCode: "FK", flag: "🇫🇰", minLength: 5, maxLength: 5 },
  { code: "+501", country: "Belize", countryCode: "BZ", flag: "🇧🇿", minLength: 7, maxLength: 7 },
  { code: "+502", country: "Guatemala", countryCode: "GT", flag: "🇬🇹", minLength: 8, maxLength: 8 },
  { code: "+503", country: "El Salvador", countryCode: "SV", flag: "🇸🇻", minLength: 8, maxLength: 8 },
  { code: "+504", country: "Honduras", countryCode: "HN", flag: "🇭🇳", minLength: 8, maxLength: 8 },
  { code: "+505", country: "Nicaragua", countryCode: "NI", flag: "🇳🇮", minLength: 8, maxLength: 8 },
  { code: "+506", country: "Costa Rica", countryCode: "CR", flag: "🇨🇷", minLength: 8, maxLength: 8 },
  { code: "+507", country: "Panama", countryCode: "PA", flag: "🇵🇦", minLength: 8, maxLength: 8 },
  { code: "+508", country: "Saint Pierre and Miquelon", countryCode: "PM", flag: "🇵🇲", minLength: 6, maxLength: 6 },
  { code: "+509", country: "Haiti", countryCode: "HT", flag: "🇭🇹", minLength: 8, maxLength: 8 },
  { code: "+590", country: "Guadeloupe", countryCode: "GP", flag: "🇬🇵", minLength: 9, maxLength: 9 },
  { code: "+591", country: "Bolivia", countryCode: "BO", flag: "🇧🇴", minLength: 8, maxLength: 8 },
  { code: "+592", country: "Guyana", countryCode: "GY", flag: "🇬🇾", minLength: 7, maxLength: 7 },
  { code: "+593", country: "Ecuador", countryCode: "EC", flag: "🇪🇨", minLength: 9, maxLength: 9 },
  { code: "+594", country: "French Guiana", countryCode: "GF", flag: "🇬🇫", minLength: 9, maxLength: 9 },
  { code: "+595", country: "Paraguay", countryCode: "PY", flag: "🇵🇾", minLength: 9, maxLength: 9 },
  { code: "+596", country: "Martinique", countryCode: "MQ", flag: "🇲🇶", minLength: 9, maxLength: 9 },
  { code: "+597", country: "Suriname", countryCode: "SR", flag: "🇸🇷", minLength: 7, maxLength: 7 },
  { code: "+598", country: "Uruguay", countryCode: "UY", flag: "🇺🇾", minLength: 8, maxLength: 8 },
  { code: "+599", country: "Netherlands Antilles", countryCode: "AN", flag: "🇦🇳", minLength: 7, maxLength: 7 },
  { code: "+670", country: "East Timor", countryCode: "TL", flag: "🇹🇱", minLength: 7, maxLength: 8 },
  { code: "+672", country: "Antarctica", countryCode: "AQ", flag: "🇦🇶", minLength: 6, maxLength: 6 },
  { code: "+673", country: "Brunei", countryCode: "BN", flag: "🇧🇳", minLength: 7, maxLength: 7 },
  { code: "+674", country: "Nauru", countryCode: "NR", flag: "🇳🇷", minLength: 7, maxLength: 7 },
  { code: "+675", country: "Papua New Guinea", countryCode: "PG", flag: "🇵🇬", minLength: 8, maxLength: 8 },
  { code: "+676", country: "Tonga", countryCode: "TO", flag: "🇹🇴", minLength: 5, maxLength: 5 },
  { code: "+677", country: "Solomon Islands", countryCode: "SB", flag: "🇸🇧", minLength: 7, maxLength: 7 },
  { code: "+678", country: "Vanuatu", countryCode: "VU", flag: "🇻🇺", minLength: 7, maxLength: 7 },
  { code: "+679", country: "Fiji", countryCode: "FJ", flag: "🇫🇯", minLength: 7, maxLength: 7 },
  { code: "+680", country: "Palau", countryCode: "PW", flag: "🇵🇼", minLength: 7, maxLength: 7 },
  { code: "+681", country: "Wallis and Futuna", countryCode: "WF", flag: "🇼🇫", minLength: 6, maxLength: 6 },
  { code: "+682", country: "Cook Islands", countryCode: "CK", flag: "🇨🇰", minLength: 5, maxLength: 5 },
  { code: "+683", country: "Niue", countryCode: "NU", flag: "🇳🇺", minLength: 4, maxLength: 4 },
  { code: "+684", country: "Samoa", countryCode: "WS", flag: "🇼🇸", minLength: 7, maxLength: 7 },
  { code: "+685", country: "American Samoa", countryCode: "AS", flag: "🇦🇸", minLength: 7, maxLength: 7 },
  { code: "+686", country: "Kiribati", countryCode: "KI", flag: "🇰🇮", minLength: 8, maxLength: 8 },
  { code: "+687", country: "New Caledonia", countryCode: "NC", flag: "🇳🇨", minLength: 6, maxLength: 6 },
  { code: "+688", country: "Tuvalu", countryCode: "TV", flag: "🇹🇻", minLength: 5, maxLength: 5 },
  { code: "+689", country: "French Polynesia", countryCode: "PF", flag: "🇵🇫", minLength: 8, maxLength: 8 },
  { code: "+690", country: "Tokelau", countryCode: "TK", flag: "🇹🇰", minLength: 4, maxLength: 4 },
  { code: "+691", country: "Micronesia", countryCode: "FM", flag: "🇫🇲", minLength: 7, maxLength: 7 },
  { code: "+692", country: "Marshall Islands", countryCode: "MH", flag: "🇲🇭", minLength: 7, maxLength: 7 },
  { code: "+850", country: "North Korea", countryCode: "KP", flag: "🇰🇵", minLength: 8, maxLength: 10 },
  { code: "+852", country: "Hong Kong", countryCode: "HK", flag: "🇭🇰", minLength: 8, maxLength: 8 },
  { code: "+853", country: "Macau", countryCode: "MO", flag: "🇲🇴", minLength: 8, maxLength: 8 },
  { code: "+855", country: "Cambodia", countryCode: "KH", flag: "🇰🇭", minLength: 9, maxLength: 9 },
  { code: "+856", country: "Laos", countryCode: "LA", flag: "🇱🇦", minLength: 9, maxLength: 10 },
  { code: "+880", country: "Bangladesh", countryCode: "BD", flag: "🇧🇩", minLength: 10, maxLength: 11 },
  { code: "+886", country: "Taiwan", countryCode: "TW", flag: "🇹🇼", minLength: 9, maxLength: 9 },
  { code: "+960", country: "Maldives", countryCode: "MV", flag: "🇲🇻", minLength: 7, maxLength: 7 },
  { code: "+961", country: "Lebanon", countryCode: "LB", flag: "🇱🇧", minLength: 8, maxLength: 8 },
  { code: "+962", country: "Jordan", countryCode: "JO", flag: "🇯🇴", minLength: 9, maxLength: 9 },
  { code: "+963", country: "Syria", countryCode: "SY", flag: "🇸🇾", minLength: 9, maxLength: 9 },
  { code: "+964", country: "Iraq", countryCode: "IQ", flag: "🇮🇶", minLength: 10, maxLength: 10 },
  { code: "+965", country: "Kuwait", countryCode: "KW", flag: "🇰🇼", minLength: 8, maxLength: 8 },
  { code: "+966", country: "Saudi Arabia", countryCode: "SA", flag: "🇸🇦", minLength: 9, maxLength: 9 },
  { code: "+967", country: "Yemen", countryCode: "YE", flag: "🇾🇪", minLength: 9, maxLength: 9 },
  { code: "+968", country: "Oman", countryCode: "OM", flag: "🇴🇲", minLength: 8, maxLength: 8 },
  { code: "+970", country: "Palestine", countryCode: "PS", flag: "🇵🇸", minLength: 9, maxLength: 9 },
  { code: "+971", country: "United Arab Emirates", countryCode: "AE", flag: "🇦🇪", minLength: 9, maxLength: 9 },
  { code: "+972", country: "Israel", countryCode: "IL", flag: "🇮🇱", minLength: 9, maxLength: 9 },
  { code: "+973", country: "Bahrain", countryCode: "BH", flag: "🇧🇭", minLength: 8, maxLength: 8 },
  { code: "+974", country: "Qatar", countryCode: "QA", flag: "🇶🇦", minLength: 8, maxLength: 8 },
  { code: "+975", country: "Bhutan", countryCode: "BT", flag: "🇧🇹", minLength: 8, maxLength: 8 },
  { code: "+976", country: "Mongolia", countryCode: "MN", flag: "🇲🇳", minLength: 8, maxLength: 8 },
  { code: "+977", country: "Nepal", countryCode: "NP", flag: "🇳🇵", minLength: 10, maxLength: 10 },
  { code: "+992", country: "Tajikistan", countryCode: "TJ", flag: "🇹🇯", minLength: 9, maxLength: 9 },
  { code: "+993", country: "Turkmenistan", countryCode: "TM", flag: "🇹🇲", minLength: 8, maxLength: 8 },
  { code: "+994", country: "Azerbaijan", countryCode: "AZ", flag: "🇦🇿", minLength: 9, maxLength: 9 },
  { code: "+995", country: "Georgia", countryCode: "GE", flag: "🇬🇪", minLength: 9, maxLength: 9 },
  { code: "+996", country: "Kyrgyzstan", countryCode: "KG", flag: "🇰🇬", minLength: 9, maxLength: 9 },
  { code: "+998", country: "Uzbekistan", countryCode: "UZ", flag: "🇺🇿", minLength: 9, maxLength: 9 },
];

// Industries list
const industries = [
  "Technology & Software",
  "E-commerce & Retail",
  "Healthcare & Medical",
  "Financial Services",
  "Education & Training",
  "Real Estate",
  "Manufacturing",
  "Professional Services",
  "Marketing & Advertising",
  "Hospitality & Tourism",
  "Food & Beverage",
  "Automotive",
  "Construction",
  "Entertainment & Media",
  "Non-Profit",
  "Government",
  "Agriculture",
  "Energy & Utilities",
  "Transportation & Logistics",
  "Other"
];

const formSchema = z.object({
  clientName: z.string().min(2, "Client name must be at least 2 characters"),
  clientEmail: z.string().email("Please enter a valid email address"),
  countryCode: z.string().min(1, "Please select a country code"),
  countryName: z.string().min(1, "Please select a country"),
  clientPhone: z.string().min(1, "Phone number is required"),
  companyName: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Please select an industry"),
  websiteUrl: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),
  instagramHandle: z.string().optional(),
  facebookPage: z.string().optional(),
  twitterHandle: z.string().optional(),
  linkedinProfile: z.string().optional(),
  automationId: z.string().min(1, "Please select an automation"),
  projectDescription: z.string().min(10, "Please provide a detailed project description"),
  meetingDate: z.date({
    required_error: "Please select a meeting date",
  }),
  meetingTime: z.string().min(1, "Please select a meeting time"),
  paymentFormat: z.enum(["recurring", "fixed"], {
    required_error: "Please select a payment format",
  }),
  customPrice: z.string().min(1, "Please enter the agreed price"),
  specialRequirements: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function NewOrder() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userAutomations, setUserAutomations] = useState<any[]>([]);
  const [loadingAutomations, setLoadingAutomations] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      clientEmail: "",
      countryCode: "+1",
      countryName: "United States",
      clientPhone: "",
      companyName: "",
      industry: "",
      websiteUrl: "",
      instagramHandle: "",
      facebookPage: "",
      twitterHandle: "",
      linkedinProfile: "",
      automationId: "",
      projectDescription: "",
      meetingTime: "",
      paymentFormat: "fixed" as const,
      customPrice: "",
      specialRequirements: "",
    },
  });

  // Fetch user's automation list
  const fetchUserAutomations = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_automations')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) {
        throw error;
      }

      setUserAutomations(data || []);
    } catch (error) {
      console.error('Error fetching user automations:', error);
      toast.error("Failed to load your automations");
    } finally {
      setLoadingAutomations(false);
    }
  };

  useEffect(() => {
    fetchUserAutomations();
  }, [user]);

  // Format price based on payment type
  const formatPrice = (price: string, paymentFormat: "fixed" | "recurring") => {
    const cleanPrice = price.replace(/[^0-9.]/g, '');
    const formattedPrice = `$${cleanPrice}`;
    return paymentFormat === "recurring" ? `${formattedPrice}/month` : formattedPrice;
  };

  // Validate phone number based on selected country and code
  const validatePhoneNumber = (phone: string, countryCode: string, countryName: string) => {
    const selectedCountry = countryCodes.find(c => c.code === countryCode && c.country === countryName);
    if (!selectedCountry) return false;
    
    const numbersOnly = phone.replace(/[^0-9]/g, '');
    return numbersOnly.length >= selectedCountry.minLength && numbersOnly.length <= selectedCountry.maxLength;
  };

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast.error("You must be logged in to create an order");
      return;
    }

    // Validate phone number
    const selectedCountry = countryCodes.find(c => c.code === data.countryCode);
    if (selectedCountry && !validatePhoneNumber(data.clientPhone, data.countryCode, selectedCountry.country)) {
      toast.error(`Phone number must be ${selectedCountry?.minLength}-${selectedCountry?.maxLength} digits for ${selectedCountry?.country}`);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get automation details
      const selectedAutomation = userAutomations.find(auto => auto.automation_id === data.automationId);
      
      // Format the full phone number
      const fullPhoneNumber = `${data.countryCode} ${data.clientPhone}`;
      
      // Format the agreed price
      const formattedPrice = formatPrice(data.customPrice, data.paymentFormat);
      
      // Create order in database
      const { error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          client_name: data.clientName,
          client_email: data.clientEmail,
          client_phone: fullPhoneNumber,
          company_name: data.companyName,
          industry: data.industry,
          website_url: data.websiteUrl || null,
          instagram_handle: data.instagramHandle || null,
          facebook_page: data.facebookPage || null,
          twitter_handle: data.twitterHandle || null,
          linkedin_profile: data.linkedinProfile || null,
          automation_id: data.automationId,
          automation_title: selectedAutomation?.automation_title || 'Unknown Automation',
          automation_price: `$${selectedAutomation?.automation_suggested_price || 0}`,
          automation_category: selectedAutomation?.automation_category || null,
          project_description: data.projectDescription,
          special_requirements: data.specialRequirements || null,
          meeting_date: format(data.meetingDate, 'PPP p'),
          payment_format: data.paymentFormat,
          agreed_price: formattedPrice,
          status: 'order_created'
        });

      if (error) {
        throw error;
      }

      toast.success("Order created successfully!");
      
      // Navigate back to dashboard with orders tab active
      navigate('/dashboard');
      window.dispatchEvent(new CustomEvent('setActiveTab', { detail: 'active-orders' }));
      
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error("Failed to create order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedAutomation = userAutomations.find(
    automation => automation.automation_id === form.watch("automationId")
  );

  const selectedCountry = countryCodes.find(c => c.code === form.watch("countryCode"));
  const selectedCountryKey = form.watch("countryCode") ? `${form.watch("countryCode")}-${selectedCountry?.country}` : "";

  if (loadingAutomations) {
    return <div className="text-center py-8">Loading your automations...</div>;
  }

  if (userAutomations.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">No Automations Available</h1>
          <p className="text-muted-foreground">
            You need to add automations to your list before creating orders.
          </p>
          <Button onClick={() => {
            navigate('/dashboard');
            window.dispatchEvent(new CustomEvent('setActiveTab', { detail: 'marketplace' }));
          }}>
            Browse Marketplace
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 px-4">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">New Order Request</h1>
        <p className="text-muted-foreground">
          Fill out this form to submit a new automation order for your client
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone Number with Country Code */}
              <FormItem className="md:col-span-2">
                <FormLabel>Phone Number</FormLabel>
                <div className="flex gap-2">
                  <div className="flex gap-2">
                    <FormField
                      control={form.control}
                      name="countryCode"
                      render={({ field }) => (
                        <FormItem className="w-40">
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              // Find the first country with this code and set it as default
                              const country = countryCodes.find(c => c.code === value);
                              if (country) {
                                form.setValue("countryName", country.country);
                              }
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-60">
                              {countryCodes.map((country) => (
                                <SelectItem 
                                  key={`${country.code}-${country.countryCode}-${country.country}`} 
                                  value={country.code}
                                >
                                  <div className="flex items-center gap-2">
                                    <span>{country.flag}</span>
                                    <span className="text-xs">{country.code}</span>
                                    <span className="text-xs truncate max-w-[120px]">{country.country}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="clientPhone"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input 
                            placeholder={selectedCountry ? `${selectedCountry.minLength}-${selectedCountry.maxLength} digits` : "Phone number"} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </FormItem>

              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Corporation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an industry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60">
                        {industries.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="websiteUrl"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Website URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Social Media Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HashIcon className="w-5 h-5" />
                Social Media Presence
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="instagramHandle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram Handle (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="@username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="facebookPage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook Page (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="facebook.com/page" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="twitterHandle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter Handle (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="@username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="linkedinProfile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn Profile (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="linkedin.com/in/username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Automation Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BuildingIcon className="w-5 h-5" />
                Automation Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="automationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Automation</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose from your automation list" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {userAutomations.map((automation) => (
                          <SelectItem key={automation.automation_id} value={automation.automation_id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{automation.automation_title}</span>
                              <div className="flex items-center gap-2 ml-4">
                                <Badge variant="secondary">{automation.automation_category}</Badge>
                                <span className="font-semibold text-primary">${automation.automation_suggested_price}</span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedAutomation && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Selected Automation:</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{selectedAutomation.automation_title}</p>
                      <Badge variant="secondary">{selectedAutomation.automation_category}</Badge>
                    </div>
                    <span className="text-lg font-bold text-primary">${selectedAutomation.automation_suggested_price}</span>
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="projectDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the specific requirements, goals, and expectations for this automation project..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Scheduling & Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5" />
                Meeting Schedule & Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    Book Meeting with Our Team
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Schedule a consultation meeting using our unified booking system
                  </p>
                  <div className="flex items-center gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => window.open("https://calendly.com/your-company/consultation", "_blank")}
                      className="flex items-center gap-2"
                    >
                      <ExternalLinkIcon className="w-4 h-4" />
                      Open Calendly Booking
                    </Button>
                    <span className="text-xs text-muted-foreground">Opens in new tab</span>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="meetingDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Meeting Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="meetingTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meeting Time</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Payment Format */}
              <FormField
                control={form.control}
                name="paymentFormat"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Payment Format</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="fixed" id="fixed" />
                          <label htmlFor="fixed" className="font-medium cursor-pointer">
                            Fixed Payment - One-time payment
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="recurring" id="recurring" />
                          <label htmlFor="recurring" className="font-medium cursor-pointer">
                            Recurring Payment - Monthly subscription
                          </label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agreed Price</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                        <Input 
                          placeholder="299" 
                          className="pl-8"
                          {...field}
                          onChange={(e) => {
                            // Only allow numbers and decimal points
                            const value = e.target.value.replace(/[^0-9.]/g, '');
                            field.onChange(value);
                          }}
                        />
                      </div>
                    </FormControl>
                    {form.watch("customPrice") && form.watch("paymentFormat") && (
                      <p className="text-sm text-muted-foreground">
                        Preview: {formatPrice(form.watch("customPrice"), form.watch("paymentFormat"))}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specialRequirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Requirements (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any special requirements, timeline considerations, or additional notes..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating Order..." : "Submit Order Request"}
          </Button>
        </form>
      </Form>
    </div>
  );
}