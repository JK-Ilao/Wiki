import pandas as pd
import sqlite3

# Define the lists for nether and end biomes
nether_biomes = ['-byg:sythian_torrids',
                 '-byg:embur_bog',
                 '-byg:glowstone_gardens',
                 '-byg:warped_desert', 
                 '-byg:subzero_hypogeal', 
                 '-byg:quartz_desert', 
                 '-byg:brimstone_caverns', 
                 '-byg:weeping_mire', 
                 '-byg:withering_woods', 
                 '-byg:magma_wastes', 
                 'byg:magma_wastes', 
                 '-byg:wailing_garth', 
                 '-byg:crimson_gardens',
                 'byg:wailing_garth',
                 '-minecraft:nether_wastes', 
                 '-minecraft:soul_sand_valley', 
                 '-minecraft:crimson_forest', 
                 '-minecraft:warped_forest', 
                 '-minecraft:basalt_deltas']
end_biomes = ['-byg:ivis_fields', 
              '-byg:bulbis_gardens', 
              '-byg:shattered_desert', 
              '-byg:ethereal_islands', 
              '-byg:purpur_peaks', 
              '-byg:cryptic_wastes', 
              '-byg:viscal_isles', 
              '-byg:shulkren_forest', 
              '-byg:nightshade_forest', 
              '-byg:imparius_grove',
              '-byg:ethereal_forest',
              '-byg:ethereal_clearing',
              '-byg:shattered_viscal_isles',
              '-minecraft:the_end', 
              '-minecraft:end_barrens', 
              '-minecraft:end_highlands', 
              '-minecraft:end_midlands', 
              '-minecraft:small_end_islands',
              '-minecraft:the_end',
              'minecraft:the_void']

# Read the CSV file
df = pd.read_csv('../database/Leggy.csv')
df2 = pd.read_csv('../database/UltraBeast.csv')
df11 = pd.read_csv('../database/ParadoxMons.csv')

# Modify the biomes column in df
def modify_biome(Biome):
    biome_list = Biome.split()
    modified_biomes = []
    for biome in biome_list:
        if biome in nether_biomes:
            modified_biomes.append(biome + ' (nether)')
        elif biome in end_biomes:
            modified_biomes.append(biome + ' (end)')
        else:
            modified_biomes.append(biome)
    return ' '.join(modified_biomes)

df['Biome'] = df['Biome'].apply(modify_biome)

# Create a connection to the SQLite database
# If the database does not exist, it will be created
conn = sqlite3.connect('../database/Legendarys.db')

# Write the DataFrame to the SQLite database
df.to_sql('Legendarys', conn, if_exists='replace', index=False)
df2.to_sql('UltraBeast', conn, if_exists='replace', index=False)
df11.to_sql('Paradox', conn, if_exists='replace', index=False)

# Close the connection to the SQLite database
conn.close()