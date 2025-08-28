import { createNativeStackNavigator, NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, ImageBackground, Text, TouchableOpacity, View } from "react-native";
import Movie from "../models/movie";
import { getFavorites } from "../utils/_database";
import styles from "../utils/styles";
import { RootStackParamList } from "./navigation/types";
import { useNavigation } from "@react-navigation/native";

const Stack = createNativeStackNavigator();


type NavProps = NativeStackNavigationProp<RootStackParamList>;

export default function FavoritesScreen() {
    const navigation = useNavigation<NavProps>();

    const currentYear = new Date().getFullYear();
    const years = Array.from(new Array(50), (val, index) => ({
        label: (currentYear - index).toString(),
        value: currentYear - index,
    }));

    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("batman");
    const [page, setPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [selectedYear, setYear] = useState(null);
    const [selectedSortingMethod, setSelectedSortingMethod] = useState("ASC");
    const [sortType, setSortType] = useState("Title");


    const fetchMovies = async (query: string, year: any, pageNumber: number) => {
        if (!query) return;

        setLoading(true);

        var yearParam = ``;
        if (year != null || year != 0) {
            yearParam = `&y=${year}`;
        }

        setLoading(true);

        let savedMoviesRaw = await getFavorites();

        let savedMovies: Movie[] = savedMoviesRaw.map((item: any) => ({
            imdbID: item.imdbID,
            Year: item.Year,
            Poster: item.Poster,
            Title: item.Title,
            Type: item.Type
        }));

        setMovies(savedMovies);
        setLoading(false);

    };

    useEffect(() => {
        const handler = setTimeout(() => {
            if (search.trim().length > 0) {
                setPage(1)
                fetchMovies(search, selectedYear, 1);
            } else {
                setMovies([])
            }
        }, 500)

        return () => {
            clearTimeout(handler);
        }
    }, [search]);

    const loadMore = () => {
        if (movies.length < totalResults && !loading) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchMovies(search, selectedYear, nextPage)
        }
    };

    const onUpdateYear = (item: any) => {
        setYear(item.value)
        setPage(1);
        fetchMovies(search, item.value, 1)
    }

    const onSortList = (method: string, type: string) => {
        setSortType(type);
        setSelectedSortingMethod(method);

        let sortedMovies: Movie[] = [];

        if (type == "Year") {
            if (method == "ASC") {
                sortedMovies = movies.sort((a, b) => parseInt(a.Year) - parseInt(b.Year))
            } else {
                sortedMovies = movies.sort((a, b) => parseInt(b.Year) - parseInt(a.Year))
            }
        }

        if (type == "Title") {
            if (method == "ASC") {
                sortedMovies = movies.sort((a, b) => parseInt(a.Title) - parseInt(b.Title))
            } else {
                sortedMovies = movies.sort((a, b) => parseInt(b.Title) - parseInt(a.Title))
            }
        }

        setMovies(sortedMovies);
    }

    const renderItem = ({ item }: { item: Movie }) => (
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Details', { omdbId: item.imdbID })}>
            <ImageBackground
                source={{ uri: item.Poster }}
                style={[styles.item, { margin: 0 }]}
                imageStyle={{ borderRadius: 10 }}
            >
                <View style={styles.overlay}>
                    <Text style={{ color: "#ffff", fontSize: 12, fontWeight: "bold" }}>{item.Title}</Text>
                    <Text style={{ color: "#ffff", fontSize: 10 }}>{item.Year}</Text>
                </View>
            </ImageBackground>
        </TouchableOpacity>
    );

    return (
        <View style={{ marginTop: 50, marginHorizontal: 20 }}>
            <View style={[styles.searchRow, { justifyContent: "space-between", }]}>
                <Text style={styles.title}>Favorites</Text>
            </View>
            <FlatList
                data={movies}
                numColumns={3}
                keyExtractor={(item) => item.imdbID}
                renderItem={renderItem}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={
                    loading ? <ActivityIndicator size="large" /> : null
                }
            />
        </View>
    );
}